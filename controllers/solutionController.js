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
        console.log(encodedCode);
        console.log(stdinEncoded);
        const payload = {
            language_id: language,
            source_code: encodedCode,
            stdin: stdinEncoded,
        };

        const querystring = {
            base64_encoded: "true",
            wait: "false",
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


        const submissionId = response.data.token;
        console.log(submissionId);

        const options = {
            method: 'GET',
            url: `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`,
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        };
        const resultResponse = await axios.request(options);

        const result = resultResponse.data;
        console.log(result);
        const newSolution = new Solution({
            userId,
            questionId,
            code,
            language,
            result: result, // Store the response data as an object
            executionTime: result.time || 0,
            stdin: result.stdin, // You can add any stdin value here
        });


        await newSolution.save();

        res.status(201).json({ data: result}); // Return the stored solution object
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