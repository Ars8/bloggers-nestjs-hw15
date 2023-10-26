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

const returnNameFromPopulation = (doc) => doc.name;

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(LikePost.name) private likePostModel: Model<LikePostDocument>,
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
  ): Promise<PaginationViewType<OutputPostDto>> {
    const totalCount = await this.postModel.count({ blogId: id });
    const posts = await this.postModel
      .find({ blogId: id })
      .sort([[query.sortBy, query.sortDirection === 'asc' ? 1 : -1]])
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .populate({
        path: 'blogName',
        transform: returnNameFromPopulation,
      })
      .lean();
    return transformToPaginationView<OutputPostDto>(
      totalCount,
      query.pageSize,
      query.pageNumber,
      idMapper(posts),
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

    const filledPosts = [];

    const findpost = posts;
    for (const i in findpost) {
      const postId = findpost[i]._id.toString();
      const currentPost = findpost[i];

      // getting likes and count
      currentPost.extendedLikesInfo.likesCount = await this.likePostModel
        .countDocuments({
          $and: [{ postId: postId }, { likeStatus: 'Like' }],
        })
        .lean();

      // getting dislikes and count
      currentPost.extendedLikesInfo.dislikesCount = await this.likePostModel
        .countDocuments({
          $and: [{ postId: postId }, { likeStatus: 'Dislike' }],
        })
        .lean();

      // getting the status of the postOwner
      let ownStatus = 'None';
      if (user) {
        const findOwnPost = await this.likePostModel.findOne({
          $and: [{ postId: postId }, { userId: user.userId }],
        });
        if (findOwnPost) {
          ownStatus = findOwnPost.likeStatus;
        }
      }
      currentPost.extendedLikesInfo.myStatus = ownStatus;

      // getting 3 last likes
      currentPost.extendedLikesInfo.newestLikes = await this.likePostModel
        .find(
          {
            $and: [{ postId: postId }, { likeStatus: 'Like' }],
          },
          {
            _id: false,
            __v: false,
            postId: false,
            likeStatus: false,
          },
        )
        .sort({ addedAt: -1 })
        .limit(3);

      filledPosts.push(currentPost);
    }
    console.log(filledPosts);

    return transformToPaginationView<OutputPostDto>(
      totalCount,
      query.pageSize,
      query.pageNumber,
      idMapper(filledPosts),
    );
  }
  async findOne(
    id: string,
    user: { userId: string; userName: string } | null,
  ): Promise<OutputPostDto | null> {
    if (!isValidObjectId(id)) return null;
    const post = await this.postModel.findById(id).lean();

    if (!post) {
      return null;
    }

    if (!user) {
      return idMapper(post);
    }

    const filledPosts = [];

    const findpost = [post];
    for (const i in findpost) {
      const postId = findpost[i]._id.toString();
      const currentPost = findpost[i];

      // getting likes and count
      currentPost.extendedLikesInfo.likesCount = await this.likePostModel
        .countDocuments({
          $and: [{ postId: postId }, { likeStatus: 'Like' }],
        })
        .lean();

      // getting dislikes and count
      currentPost.extendedLikesInfo.dislikesCount = await this.likePostModel
        .countDocuments({
          $and: [{ postId: postId }, { likeStatus: 'Dislike' }],
        })
        .lean();

      // getting the status of the postOwner
      let ownStatus = 'None';
      if (user) {
        const findOwnPost = await this.likePostModel.findOne({
          $and: [{ postId: postId }, { userId: user.userId }],
        });
        if (findOwnPost) {
          ownStatus = findOwnPost.likeStatus;
        }
      }
      currentPost.extendedLikesInfo.myStatus = ownStatus;

      // getting 3 last likes
      currentPost.extendedLikesInfo.newestLikes = await this.likePostModel
        .find(
          {
            $and: [{ postId: postId }, { likeStatus: 'Like' }],
          },
          {
            _id: false,
            __v: false,
            postId: false,
            likeStatus: false,
          },
        )
        .sort({ addedAt: -1 })
        .limit(3);

      filledPosts.push(currentPost);
    }

    return idMapper(filledPosts[0]);
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
    console.log(likePost);
    await likePost.save();
    return true;
  }
}
