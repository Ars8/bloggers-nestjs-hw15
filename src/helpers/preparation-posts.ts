import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsType } from 'src/posts/dto/posts-type.dto';
import {
  LikePost,
  LikePostDocument,
} from 'src/posts/entities/like-post.entity';

@Injectable()
export class PreparationPosts {
  constructor(
    @InjectModel(LikePost.name) private likePostModel: Model<LikePostDocument>,
  ) {}
  async preparationPostsForReturn(
    postArray: PostsType[],
    currentUser: { userId: string; userName: string } | null,
  ): Promise<PostsType[]> {
    const filledPosts = [];

    for (const i in postArray) {
      const postId = postArray[i].id;
      const currentPost = postArray[i];

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
      if (currentUser) {
        const findOwnPost = await this.likePostModel.findOne({
          $and: [{ postId: postId }, { userId: currentUser.userId }],
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
    return filledPosts;
  }
}
