const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { randomUUID } = require("crypto");
const { z } = require("zod");

const MAX_EXECUTION_TIME = 2000; // 2 seconds
const MAX_MEMORY_MB = 256;
const isWindows = process.platform === "win32";

function extractJavaClassName(code) {
    const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    return match ? match[1] : "Main";
}

const languageConfig = {
    python: { compiler: null, executor: "python3", extension: ".py" },
    javascript: { compiler: null, executor: "node", extension: ".js" },
    cpp: {
        compiler: "g++",
        executor: null,
        extension: ".cpp",
        compileArgs: (filepath, outputPath) => [
            filepath,
            "-o",
            outputPath,
        ],
    },
    java: { compiler: "javac", executor: "java", extension: ".java" },
};

async function compileCode(language, filepath, outputPath) {
    const config = languageConfig[language];
    if (!config.compiler) return { success: true };

    return new Promise((resolve) => {
        const args =
            language === "cpp"
                ? config.compileArgs(filepath, outputPath)
                : [filepath];
        const process = spawn(config.compiler, args, {
            cwd: path.dirname(filepath),
        });
        let error = "";

        process.stderr.on("data", (data) => {
            error += data.toString();
        });
        process.on("close", (code) => {
            resolve({ success: code === 0, error: error || undefined });
        });
    });
}

async function executeCode(language, filepath, input) {
    const config = languageConfig[language];
    const start = Date.now();
    const cwd = path.dirname(filepath);

    let executable = filepath;
    let args = [];

    if (language === "java") {
        const javaCode = await fs.readFile(filepath, "utf-8");
        const className = extractJavaClassName(javaCode);
        executable = config.executor;
        args = ["-cp", cwd, className];
    } else if (language === "cpp") {
        executable = filepath.replace(".cpp", isWindows ? ".exe" : "");
    } else {
        executable = config.executor;
        args = [filepath];
    }

    return new Promise((resolve) => {
        const process = spawn(executable, args, {
            cwd,
            timeout: MAX_EXECUTION_TIME,
            stdio: ["pipe", "pipe", "pipe"],
        });
        let output = "",
            error = "",
            timedOut = false;

        if (input) {
            process.stdin.write(input);
            process.stdin.end();
        }
        process.stdout.on("data", (data) => {
            output += data.toString();
        });
        process.stderr.on("data", (data) => {
            error += data.toString();
        });

        const timeoutId = setTimeout(() => {
            timedOut = true;
            process.kill();
        }, MAX_EXECUTION_TIME);
        process.on("close", () => {
            clearTimeout(timeoutId);
            resolve({
                output,
                error: error || undefined,
                timedOut,
                executionTime: Date.now() - start,
            });
        });
    });
}

async function executeCodeSubmission(req, res) {
    try {
        const submission = req.body;
        const config = languageConfig[submission.language];
        if (!config) throw new Error(`Unsupported language: ${submission.language}`);

        const tempDir = path.join(os.tmpdir(), `code_exec_${randomUUID()}`);
        await fs.mkdir(tempDir, { recursive: true });
        let filename = `code_${randomUUID()}${config.extension}`;
        if (submission.language === "java")
            filename = `${extractJavaClassName(submission.code)}.java`;

        const filepath = path.join(tempDir, filename);
        await fs.writeFile(filepath, submission.code);

        let outputPath = filepath.replace(".cpp", isWindows ? ".exe" : "");
        if (config.compiler) {
            const { success, error } = await compileCode(
                submission.language,
                filepath,
                outputPath
            );
            if (!success) {
                await fs.rm(tempDir, { recursive: true, force: true });
                return res.json({
                    status: "error",
                    error: `Compilation Error: ${error}`,
                    executionTime: 0,
                });
            }
        }

        const { output, error, timedOut, executionTime } = await executeCode(
            submission.language,
            filepath,
            submission.input
        );
        let status = timedOut ? "error" : "completed";
        let errorMessage = timedOut ? "Time Limit Exceeded" : error;

        res.json({
            status,
            output: output || undefined,
            error: errorMessage,
            executionTime,
        });

        await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ message: "Invalid submission data" });
        res.status(500).json({ message: "Failed to execute code" });
    }
}

module.exports = { executeCodeSubmission };
