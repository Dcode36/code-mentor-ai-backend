const Solution = require('../models/Solution');
const axios = require('axios');
const { clerkClient } = require('@clerk/express');
const User = require('../models/User');
exports.submitSolution = async (req, res) => {
    const { userId, questionId, code, language, stdin } = req.body;

    try {

        // Validate the input

        const user = await User.findOne({ userId: userId });

        if (!user) {
            return res.status(400).json({ message: "Please Log in first to submit you solution" });
        }
        const encodedCode = Buffer.from(code).toString('base64');
        const stdinEncoded = stdin ? Buffer.from(stdin).toString('base64') : '';
        const payload = {
            language_id: language,
            source_code: encodedCode,
            stdin: stdinEncoded,
        };

        const querystring = {
            base64_encoded: "true",
            wait: "true",
            fields: "*",
        };

        const headers = {
            "x-rapidapi-key": process.env.RAPID_API_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json",
        };

        const response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions",
            payload,
            { params: querystring, headers: headers }
        );



        const result = response.data;
        const decodedSourceCode = Buffer.from(result.source_code, 'base64').toString('utf-8');
        const decodedStdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
        const decodedStdin = result.stdin ? Buffer.from(result.stdin, 'base64').toString('utf-8') : '';

        const newSolution = new Solution({
            userId,
            questionId,
            code: decodedSourceCode,
            language,
            result: result,
            executionTime: result.time || 0,
            stdin: decodedStdin,
            output: decodedStdout,  
        });


        await newSolution.save();

        res.status(201).json({
            data: {
                ...result,
                decodedSourceCode,
                decodedStdout,
                decodedStdin,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit solution' });
    }
};


// GET: Get all solutions for a question
// exports.getSolutionsForQuestion = async (req, res) => {
//     try {
//         const solutions = await Solution.find({ questionId: req.params.questionId });
//         res.status(200).json(solutions);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to get solutions' });
//     }
// };

exports.getSolutionById = async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id);
        if (!solution) {
            return res.status(404).json({ message: 'Solution not found' });

        }
        // Decode the base64 source code
        const decodedSourceCode = Buffer.from(solution.result.source_code, 'base64').toString('utf-8');

        // Add the decoded source code to the response
        solution.result.source_code = decodedSourceCode;

        res.status(200).json(solution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get solution' });
    }
};


exports.getLanguagesAndIds = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://judge0-ce.p.rapidapi.com/languages',
            params: { fields: '*' },
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const languages = response.data;

        // Extract language names and IDs
        const languageList = languages.map(language => ({
            name: language.name,
            id: language.id
        }));

        res.status(200).json(languageList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get languages' });
    }
}