import React from 'react'
import Link from 'next/link'

'use client'


const ChallengesPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Coding Challenges</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Challenge Cards */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Challenge 1</h2>
                    <p className="text-gray-600 mb-4">Description of the first challenge...</p>
                    <Link 
                        href="/challenges/1" 
                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Start Challenge
                    </Link>
                </div>
                
                {/* Add more challenge cards as needed */}
            </div>
        </div>
    )
}

export default ChallengesPage