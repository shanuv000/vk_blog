const https = require('https');
const http = require('http');

// Configuration from API_USAGE.md
const BASE_URL = 'https://ai.urtechy.com';
const API_KEY = 'agp_9dS82kP1J7xWmQZs';

// Models to test
const TESTS = [
    {
        name: 'Gemini Connectivity (gemini-2.5-flash)',
        model: 'gemini-2.5-flash',
        prompt: 'Reply with ONLY the word "Pong"',
        expected: 'Pong'
    },
    {
        name: 'Claude Connectivity (claude-3-5-sonnet-20241022)',
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Reply with ONLY the word "Pong"',
        expected: 'Pong'
    }
];

async function callApi(model, prompt) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}/v1/messages`);
        const options = {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        };

        const body = JSON.stringify({
            model: model,
            max_tokens: 100,
            messages: [
                { role: 'user', content: prompt }
            ]
        });

        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            success: true,
                            status: res.statusCode,
                            content: parsed.content?.[0]?.text || '',
                            raw: parsed
                        });
                    } catch (e) {
                        resolve({
                            success: false,
                            status: res.statusCode,
                            error: 'Invalid JSON response',
                            raw: data
                        });
                    }
                } else {
                    resolve({
                        success: false,
                        status: res.statusCode,
                        error: `HTTP Error ${res.statusCode}`,
                        raw: data
                    });
                }
            });
        });

        req.on('error', (e) => {
            resolve({ success: false, error: e.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'Request Timeout (10s)' });
        });

        req.setTimeout(10000);

        req.write(body);
        req.end();
    });
}

function printResult(name, success, message) {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} [${name}]`);
    if (message) console.log(`   ${message}`);
    console.log('-'.repeat(40));
}

async function runTests() {
    console.log('🚀 Starting API Verification Tests...\n');

    let allPassed = true;

    for (const test of TESTS) {
        console.log(`Testing: ${test.name}...`);
        try {
            const result = await callApi(test.model, test.prompt);

            if (result.success) {
                const content = result.content.trim();
                const matches = content.includes(test.expected);

                if (matches) {
                    printResult(test.name, true, `Response: "${content}"`);
                } else {
                    printResult(test.name, false, `Content Mismatch.\n   Expected: "${test.expected}"\n   Got: "${content}"`);
                    allPassed = false;
                }
            } else {
                printResult(test.name, false, `API Error: ${result.error} (Status: ${result.status})\n   Raw Response: ${result.raw}`);
                allPassed = false;
            }

        } catch (e) {
            printResult(test.name, false, `Script Error: ${e.message}`);
            allPassed = false;
        }
    }

    // Final System Prompt Test (advanced feature check)
    console.log('Testing: System Prompt Support...');
    try {
        const url = new URL(`${BASE_URL}/v1/messages`);
        const options = {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        };
        const body = JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 100,
            system: 'You are a pirate.',
            messages: [{ role: 'user', content: 'Say hello.' }]
        });

        // We'll just do a quick fetch-like wrapper again or reuse logic
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const parsed = JSON.parse(data);
                const text = parsed.content?.[0]?.text || '';
                // Check if it sounds like a pirate (Ahoy, Matey, etc)
                const isPirate = /ahoy|matey|arr|yer/i.test(text);
                if (isPirate) {
                    printResult('System Prompt Support', true, `Pirate Response: "${text}"`);
                } else {
                    printResult('System Prompt Support', false, `Did not sound like a pirate: "${text}"`);
                    allPassed = false;
                }
                finish(allPassed);
            });
        });

        req.on('timeout', () => {
            req.destroy();
            printResult('System Prompt Support', false, 'Request Timeout (10s)');
            finish(false);
        });

        req.setTimeout(10000);
        req.write(body);
        req.end();

        return; // Wait for callback
    } catch (e) {
        printResult('System Prompt Support', false, e.message);
        finish(false);
    }
}

function finish(passed) {
    if (passed) {
        console.log('\n🎉 ALL TESTS PASSED! API is fully operational.');
        process.exit(0);
    } else {
        console.log('\n⚠️ SOME TESTS FAILED. Please review the logs.');
        process.exit(1);
    }
}

runTests();
