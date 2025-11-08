import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { Comment } from '../App';

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Avatar className="size-10">
        <AvatarImage src={comment.avatar} alt={comment.username} />
        <AvatarFallback>{comment.username[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-900 dark:text-white">{comment.username}</span>
          <span className="text-gray-500 dark:text-gray-400">·</span>
          <span className="text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {comment.text}
        </p>
      </div>
    </div>
  );
}
