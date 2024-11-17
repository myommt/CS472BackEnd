export interface Policy {
    id: number;
    title: string;
    description: string;
    owner: string;
    date: string;
    category: string;
    votes: number;
    voters: Voter[];
}

export interface Voter {
    voterid: number;
}