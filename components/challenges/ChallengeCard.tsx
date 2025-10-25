import React from 'react';

interface ChallengeCardProps {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    completed?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
    title,
    description,
    difficulty,
    points,
    completed = false,
}) => {
    const difficultyColor = {
        Easy: 'text-green-500',
        Medium: 'text-yellow-500',
        Hard: 'text-red-500',
    };

    return (
        <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <span className={`${difficultyColor[difficulty]} font-medium`}>
                    {difficulty}
                </span>
            </div>
            <p className="text-gray-600 mb-3">{description}</p>
            <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">{points} points</span>
                {completed && (
                    <span className="text-green-500">
                        ✓ Completed
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChallengeCard;