import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  studentName: string;
  studentEmail: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  assignmentId: string;
  submittedAt: string;
}

interface LeaderboardProps {
  submissions: LeaderboardEntry[];
  assignmentTitle: string;
}

export function Leaderboard({ submissions, assignmentTitle }: LeaderboardProps) {
  // Sort submissions by score (highest first)
  const sortedSubmissions = [...submissions].sort((a, b) => b.percentage - a.percentage);
  
  // Assign ranks
  const rankedSubmissions = sortedSubmissions.map((submission, index) => ({
    ...submission,
    rank: index + 1
  }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="font-bold">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 2:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      case 3:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">🏆 {assignmentTitle} Leaderboard</h3>
        <Badge variant="outline">{rankedSubmissions.length} Students</Badge>
      </div>
      
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {rankedSubmissions.map((submission) => (
            <div 
              key={submission.id} 
              className="p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getRankBadge(submission.rank)}`}>
                  {getRankIcon(submission.rank)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{submission.studentName}</p>
                  <p className="text-sm text-muted-foreground truncate">{submission.studentEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
                <div className="text-right min-w-0">
                  <p className="font-medium whitespace-nowrap truncate">
                    {submission.score}
                    <span className="text-muted-foreground">/{submission.maxScore}</span>
                  </p>
                  <p className="text-sm text-muted-foreground truncate"></p>
                </div>
                <Badge 
                  className={submission.percentage >= 90 ? 'bg-green-500' : 
                            submission.percentage >= 80 ? 'bg-blue-500' : 
                            submission.percentage >= 70 ? 'bg-yellow-500' : 
                            'bg-red-500'}
                >
                  {submission.percentage >= 90 ? 'A' : 
                   submission.percentage >= 80 ? 'B' : 
                   submission.percentage >= 70 ? 'C' : 'D'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {rankedSubmissions.length === 0 && (
          <div className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No submissions to display on the leaderboard yet.</p>
          </div>
        )}
      </Card>
      
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500 truncate">
            {rankedSubmissions.length > 0 ? rankedSubmissions[0]?.studentName : 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">Top Performer</p>
        </Card>
        
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary truncate">
          </p>
          <p className="text-sm text-muted-foreground">Class Average</p>
        </Card>
        
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500 truncate">
            {rankedSubmissions.filter(s => s.percentage >= 90).length}
          </p>
          <p className="text-sm text-muted-foreground">A Grades</p>
        </Card>
      </div>
    </div>
  );
}