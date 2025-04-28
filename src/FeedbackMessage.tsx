import { UserFeedback } from './types';

export default function FeedbackMessage({
  feedback,
}: {
  feedback: UserFeedback | null;
}) {
  if (!feedback) return null;

  const bgColor =
    feedback.type === 'success'
      ? 'bg-green-100 border-green-500'
      : feedback.type === 'error'
        ? 'bg-red-100 border-red-500'
        : 'bg-blue-100 border-blue-500';

  const textColor =
    feedback.type === 'success'
      ? 'text-green-700'
      : feedback.type === 'error'
        ? 'text-red-700'
        : 'text-blue-700';

  return (
    <div className={`mb-4 rounded-lg border p-4 ${bgColor}`}>
      <p className={`text-sm ${textColor}`}>{feedback.message}</p>
    </div>
  );
}
