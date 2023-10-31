import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { idMapper } from 'src/helpers/id-mapper';
import { QueryType } from 'src/helpers/queryHandler';
import {
  PaginationViewType,
  transformToPaginationView,
} from 'src/helpers/transformToPaginationView';
import { CreatePostDto } from './dto/create-post.dto';
import { OutputPostDto } from './dto/output-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './entities/post.entity';
import { LikeStatusPostDto } from './dto/like-status-post.dto';
import { LikePost, LikePostDocument } from './entities/like-post.entity';
import { PreparationPosts } from 'src/posts/preparation.posts';

const returnNameFromPopulation = (doc) => doc.name;

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(LikePost.name) private likePostModel: Model<LikePostDocument>,
    private preparationPostsForReturn: PreparationPosts,
  ) {}
  async create(createPostDto: CreatePostDto): Promise<OutputPostDto> {
    const createdPost = new this.postModel({
      ...createPostDto,
      createdAt: new Date().toISOString(),
      blogName: createPostDto.title,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: {},
      },
    });
    await createdPost.save();
    return idMapper(createdPost.toObject());
  }
  async findAllPostsForBlog(
    query: QueryType,
    id: string,
    user: { userId: string; userName: string } | null,
  ): Promise<PaginationViewType<OutputPostDto>> {
    const totalCount = await this.postModel.count({ blogId: id });
    const posts = await this.postModel
      .find({ blogId: id })
      .sort([[query.sortBy, query.sortDirection === 'asc' ? 1 : -1]])
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .lean();

    const filledPosts =
      await this.preparationPostsForReturn.preparationPostsForReturn(
        idMapper(posts),
        user,
      );

    return transformToPaginationView<OutputPostDto>(
      totalCount,
      query.pageSize,
      query.pageNumber,
      filledPosts,
    );
  }
  async findAll(
    query: QueryType,
    user: { userId: string; userName: string } | null,
  ): Promise<PaginationViewType<OutputPostDto>> {
    const totalCount = await this.postModel.count({
      title: { $regex: query.searchNameTerm, $options: 'i' },
    });
    const posts = await this.postModel
      .find(
        {},
        {
          __v: false,
        },
      )
      .limit(query.pageSize)
      .skip(query.pageSize * (query.pageNumber - 1))
      .sort({ [query.sortBy]: query.sortDirection })
      .lean();

    const filledPosts =
      await this.preparationPostsForReturn.preparationPostsForReturn(
        idMapper(posts),
        user,
      );

    return transformToPaginationView<OutputPostDto>(
      totalCount,
      query.pageSize,
      query.pageNumber,
      filledPosts,
    );
  }
  async findOne(
    id: string,
    user: { userId: string; userName: string } | null,
  ): Promise<OutputPostDto | null> {
    if (!isValidObjectId(id)) return null;
    const post = await this.postModel.findById(id).lean();

    //console.log(idMapper(post).extendedLikesInfo.likesCount);
    //console.log(idMapper(post));

    if (!post) {
      return null;
    }

    if (!user) {
      return idMapper(post);
    }

    const filledPost =
      await this.preparationPostsForReturn.preparationPostsForReturn(
        [idMapper(post)],
        user,
      );

    //console.log(filledPost[0]);

    return idMapper(filledPost[0]);
  }
  async update(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const post = await this.postModel.findById(id);
    if (!post) return false;
    post.title = updatePostDto.title;
    post.shortDescription = updatePostDto.shortDescription;
    post.content = updatePostDto.content;
    post.blogId = updatePostDto.blogId;
    await post.save();
    return true;
  }
  async remove(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const deletedPost = await this.postModel.findByIdAndDelete(id);
    if (!deletedPost) return false;
    return true;
  }
  async changeLikeStatusPost(
    postId: string,
    user: {
      userId: string;
      userName: string;
    },
    likeStatus: LikeStatusPostDto,
  ): Promise<boolean> {
    if (!isValidObjectId(postId)) return false;
    const post = await this.postModel.findById(postId);
    if (!post) return false;
    const userId = user.userId;
    const addedAt = new Date().toISOString();
    const likePost = await this.likePostModel.findOneAndUpdate(
      {
        $and: [{ postId: postId }, { userId: userId }],
      },
      {
        postId: postId,
        userId: userId,
        login: user.userName,
        likeStatus: likeStatus.likeStatus,
        addedAt: addedAt,
      },
      { upsert: true },
    );
    if (!likePost) return false;
    await likePost.save();
    return true;
  }
}
