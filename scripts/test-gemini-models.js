const https = require('https');

// Configuration from API_USAGE.md
const BASE_URL = 'https://ai.urtechy.com';
const API_KEY = 'agp_9dS82kP1J7xWmQZs';

// Gemini Models to test (from API_USAGE.md)
const GEMINI_MODELS = [
    { name: 'gemini-2.5-flash', description: 'Fast, low latency' },
    { name: 'gemini-2.5-flash-thinking', description: 'Fast with reasoning output' },
    { name: 'gemini-3-flash', description: 'Extremely fast' },
    { name: 'gemini-3-pro-low', description: 'Balanced speed/intelligence' },
    { name: 'gemini-3-pro-high', description: 'Most Powerful. Deep reasoning' }
];

async function callApi(model, prompt, timeout = 15000) {
    return new Promise((resolve) => {
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
            max_tokens: 50,
            messages: [{ role: 'user', content: 'Reply with ONLY the word "Pong"' }]
        });

        const startTime = Date.now();

        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const latency = Date.now() - startTime;
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            success: true,
                            status: res.statusCode,
                            content: parsed.content?.[0]?.text || '',
                            latency,
                            raw: parsed
                        });
                    } catch (e) {
                        resolve({
                            success: false,
                            status: res.statusCode,
                            error: 'Invalid JSON response',
                            latency,
                            raw: data
                        });
                    }
                } else {
                    resolve({
                        success: false,
                        status: res.statusCode,
                        error: `HTTP Error ${res.statusCode}`,
                        latency,
                        raw: data
                    });
                }
            });
        });

        req.on('error', (e) => {
            resolve({ success: false, error: e.message, latency: Date.now() - startTime });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: `Timeout (${timeout}ms)`, latency: timeout });
        });

        req.setTimeout(timeout);

        req.write(body);
        req.end();
    });
}

function printResult(model, success, message, latency) {
    const icon = success ? '✅' : '❌';
    const latencyStr = latency ? `(${latency}ms)` : '';
    console.log(`${icon} ${model} ${latencyStr}`);
    if (message) console.log(`   ${message}`);
    console.log('-'.repeat(50));
}

async function runTests() {
    console.log('🚀 Gemini Models Verification Test\n');
    console.log('Base URL:', BASE_URL);
    console.log('Timeout: 15s per model\n');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const { name, description } of GEMINI_MODELS) {
        console.log(`\nTesting: ${name}`);
        console.log(`Description: ${description}`);

        const result = await callApi(name, 'Reply with ONLY the word "Pong"');

        if (result.success) {
            const content = result.content.trim();
            const matches = content.toLowerCase().includes('pong');
            if (matches) {
                printResult(name, true, `Response: "${content}"`, result.latency);
                passed++;
                results.push({ model: name, status: '✅ PASS', latency: `${result.latency}ms` });
            } else {
                printResult(name, false, `Unexpected response: "${content}"`, result.latency);
                failed++;
                results.push({ model: name, status: '❌ FAIL', latency: `${result.latency}ms`, error: 'Unexpected response' });
            }
        } else {
            printResult(name, false, `Error: ${result.error}`, result.latency);
            failed++;
            results.push({ model: name, status: '❌ FAIL', latency: result.latency ? `${result.latency}ms` : 'N/A', error: result.error });
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`\nPassed: ${passed}/${GEMINI_MODELS.length}`);
    console.log(`Failed: ${failed}/${GEMINI_MODELS.length}\n`);

    console.log('Model                          | Status   | Latency');
    console.log('-'.repeat(55));
    for (const r of results) {
        console.log(`${r.model.padEnd(30)} | ${r.status.padEnd(8)} | ${r.latency}`);
    }

    if (failed === 0) {
        console.log('\n🎉 ALL GEMINI MODELS ARE OPERATIONAL!');
        process.exit(0);
    } else {
        console.log('\n⚠️ SOME MODELS FAILED. See details above.');
        process.exit(1);
    }
}

runTests();
