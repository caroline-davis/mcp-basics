#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class McpBasicsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-basics',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Load tools from tools.json
    this.tools = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools.json'), 'utf-8'));

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.tools.map(tool => ({
        name: tool.name,
        description: `Execute ${tool.name}: ${tool.tool}`,
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Directory to run the command in (optional, defaults to current directory)',
            },
          },
          required: [],
        },
      })),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const tool = this.tools.find(t => t.name === toolName);
      
      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${toolName}`
        );
      }

      const args = request.params.arguments || {};
      const workingDir = args.directory || process.cwd();

      try {
        const result = await this.executeCommand(tool.tool, workingDir);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully executed ${tool.name}:\n\nCommand: ${tool.tool}\nDirectory: ${workingDir}\n\nOutput:\n${result.stdout}\n\nErrors:\n${result.stderr}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${tool.name}:\n\nCommand: ${tool.tool}\nDirectory: ${workingDir}\n\nError: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  executeCommand(command, workingDir) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, {
        shell: true,
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed with exit code ${code}:\n${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Basics server running on stdio');
  }
}

const server = new McpBasicsServer();
server.run().catch(console.error);
