import { Request, Response, RequestHandler } from "express";
import fs from 'node:fs';
import path from 'node:path';
import { Policy, Voter } from './interface/policy.ts';

let policies: Policy[] = [];
const filePath = '/data/policies.json';

const readPoliciesFile = () => {
    const dataPath = path.join(__dirname, filePath);
    console.log(dataPath);
    try {
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf-8');
            policies = JSON.parse(data);
        }
        else {
            policies = [];
        }
    } catch (error) {
        policies = [];
    }
    return policies;
};

const savePoliciesFile = () => {
    const dataPath = path.join(__dirname, filePath);
    fs.writeFileSync(dataPath, JSON.stringify(policies));
};

readPoliciesFile();

export const getPolicies: RequestHandler<unknown,
    { responseBodyStatus: number, responseBodySuccess: boolean, responseBodyPolicy?: Policy[], responseBodyMessage: string; },
    unknown,
    unknown> =

    (req, res) => {
        try {
            res.json({ responseBodyStatus: 200, responseBodySuccess: true, responseBodyPolicy: policies, responseBodyMessage: '' });
        }
        catch (error) {
            res.json({ responseBodyStatus: 500, responseBodySuccess: false, responseBodyMessage: 'Internal server error' });
        }

    };

export const getPoliciesByYear: RequestHandler<{ year: string; },
    { responseBodyStatus: number, responseBodySuccess: boolean, responseBodyPolicy?: Policy[], responseBodyMessage: string; },
    unknown,
    unknown> = (req, res) => {
        console.log(req.params.year);
        const year = parseInt(req.params.year, 10);
        const filteredPolicies = policies.filter
            (policy => new Date(policy.date).getFullYear() === year)
            .sort((a, b) => b.votes - a.votes);
        try {
            res.json({ responseBodyStatus: 200, responseBodySuccess: true, responseBodyPolicy: filteredPolicies, responseBodyMessage: '' });
        }
        catch (error) {
            res.json({ responseBodyStatus: 500, responseBodySuccess: false, responseBodyMessage: 'Internal server error' });
        }
    };

export const addPolicy: RequestHandler<unknown,
    { responseBodyStatus: number, responseBodySuccess: boolean, responseBodyPolicy?: Policy, responseBodyMessage: string; },
    Policy,
    unknown> = (req, res) => {
        const { id, date, votes, voters, ...rest } = req.body as Policy;
        const newPolicy: Policy = {
            id: Date.now(),
            date: new Date().toISOString(),
            votes: 0,
            voters: [],
            ...rest
        };
        try {
            policies.push(newPolicy);
            savePoliciesFile();

            res.json({ responseBodyStatus: 201, responseBodySuccess: true, responseBodyPolicy: newPolicy, responseBodyMessage: '' });
        }
        catch (error) {
            res.json({ responseBodyStatus: 500, responseBodySuccess: false, responseBodyMessage: 'Internal server error' });
        }
    };


export const votePolicy: RequestHandler<unknown,
    { responseBodyStatus: number, responseBodySuccess: boolean, responseBodyPolicy: Policy | null, responseBodyMessage: string; },
    { requestBodyPolicy: Policy, requestBodyVoter: Voter; },
    unknown> =
    (req, res, next) => {
        const dataPath = path.join(__dirname, filePath);

        const { requestBodyPolicy, requestBodyVoter } = req.body;
        const policy = policies.find((p: Policy) => p.id === requestBodyPolicy.id);
        try {
            if (policy) {

                const voterExists = policy.voters.find(voter => voter.voterid === requestBodyVoter.voterid);
                if (voterExists) {
                    res.json({ responseBodyStatus: 400, responseBodySuccess: false, responseBodyPolicy: null, responseBodyMessage: 'Voter has already voted for this policy' });
                }
                else {
                    policy.votes += 1;

                    const newVoter: Voter = { voterid: requestBodyVoter.voterid };
                    policy.voters.push(newVoter);

                    fs.writeFileSync(dataPath, JSON.stringify(policies));
                    res.json({ responseBodyStatus: 200, responseBodySuccess: true, responseBodyPolicy: policy, responseBodyMessage: 'Vote cast successfully' });
                }


            } else {
                res.json({ responseBodyStatus: 400, responseBodySuccess: false, responseBodyPolicy: null, responseBodyMessage: 'Policy not found' });
            }
        }
        catch (error) {
            res.json({ responseBodyStatus: 500, responseBodySuccess: false, responseBodyPolicy: null, responseBodyMessage: 'Internal server error' });
        }

    };