# MCP Basics

A centralized Model Context Protocol (MCP) server that provides common development tools across all your Cline projects. Instead of installing tools individually in each project, use this single MCP server to access formatting, translation, and other development utilities.

## Features

- **mcp-formatter**: Code formatting using Prettier (`npx prettier --write .`)
- **mcp-translator**: JavaScript to TypeScript migration (`npx ts-migrate`)
- **Centralized tool management**: Add tools once, use everywhere
- **Directory-specific execution**: Run tools in any project directory

## Installation

1. Clone this repository:
```bash
git clone https://github.com/caroline-davis/mcp-basics.git
cd mcp-basics
```

2. Install dependencies:
```bash
npm install
```

3. Test the server (optional):
```bash
node index.js
```

## Configuration

In VSCode, set up your MCP settings and add Local MCP Basics as a new entry inside the mcpServers object:

**Configuration:**
```json
{
  "mcpServers": {
    "Local MCP Basics": {
      "disabled": false,
      "timeout": 60,
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-basics/index.js"]
    }
  }
}
```

Replace `/path/to/mcp-basics/index.js` with the actual path to your cloned repository.

## Usage

Once configured, you can use these tools in any Cline project by simply asking:

- **"Use the mcp-formatter tool to format this code"**
- **"Run the mcp-translator tool to convert JavaScript to TypeScript"**
- **"Format the code using prettier"**

The tools will execute in your current project directory automatically.

### Tool Parameters

Each tool accepts an optional `directory` parameter:

```javascript
// Example: Format code in a specific directory
{
  "directory": "/path/to/specific/folder"
}
```

If no directory is specified, tools run in the current working directory.

## Adding New Tools

To add new tools to the server:

1. Edit `tools.json` and add your tool:
```json
[
  {
    "name": "your-tool-name",
    "tool": "your-command-here"
  }
]
```

2. The tool will automatically be available in Cline without restarting.

### Example: Adding ESLint

```json
[
  {
    "name": "mcp-translator",
    "tool": "npx ts-migrate"
  },
  {
    "name": "mcp-formatter", 
    "tool": "npx prettier --write ."
  },
  {
    "name": "mcp-linter",
    "tool": "npx eslint . --fix"
  }
]
```

## Project Structure

```
mcp-basics/
├── index.js          # Main MCP server implementation
├── tools.json        # Tool configuration
├── package.json      # Node.js dependencies
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Development

### Running the Server

```bash
node index.js
```

The server will start and listen for MCP protocol messages via stdio.

### Testing Tools

You can test individual tools by calling them through the MCP protocol or by running the commands directly:

```bash
# Test formatter
npx prettier --write .

# Test translator
npx ts-migrate
```

## How It Works

This MCP server:

1. **Reads tool definitions** from `tools.json`
2. **Exposes tools** via the MCP protocol to Cline
3. **Executes commands** in the specified directory when called
4. **Returns results** with stdout, stderr, and execution status

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- Cline with MCP support

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Add your tools to `tools.json`
3. Test the changes
4. Submit a pull request

---

**Note:** This server runs locally and doesn't require any external API keys or authentication. All tools execute using your local development environment.
