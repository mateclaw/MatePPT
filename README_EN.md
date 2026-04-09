<div align="center">

<img src="./public/imgs/logo.svg" alt="MatePPT Logo" width="88" />

# MatePPT

An AI PPT frontend project covering topic input, project creation, template selection, work management, and full classic PPT editing capabilities.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)
![Umi](https://img.shields.io/badge/Umi-4.x-1890ff)
![Status](https://img.shields.io/badge/Status-Active-22c55e)

[中文](./README.md) | [English](./README_EN.md)

[Online Demo](https://mateclaw.github.io/MatePPT/) · [Quick Start](#quick-start) · [Features](#features) · [License](./LICENSE)

</div>

---

## 🎬 Video Demo

https://github.com/user-attachments/assets/c4a3d9df-6d97-42d7-8c4e-692a0f3813ee

<p align="center">
  A full walkthrough of the core AI PPT workflow, from outline generation to editing and exporting.
</p>

## 🌐 Online Demo

Demo URL: [https://mateclaw.github.io/MatePPT/](https://mateclaw.github.io/MatePPT/)

This address is intended for quickly experiencing the core workflow of the project, including outline generation, template selection, slide editing, and export capabilities.

## 🖼️ Showcase

<table>
  <tr>
    <td align="center" width="50%">
      <img src="./docs/readme-assets/demo_diagram1.png" alt="Knowledge Graph Retrieval" />
      <br />
      <strong>Knowledge Graph Retrieval Overview</strong>
    </td>
    <td align="center" width="50%">
      <img src="./docs/readme-assets/demo_diagram2.png" alt="History of Artificial Intelligence" />
      <br />
      <strong>History of Artificial Intelligence</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="./docs/readme-assets/demo_diagram3.png" alt="Study Strategies for University Students" />
      <br />
      <strong>Efficient Study Strategies for University Students</strong>
    </td>
    <td align="center" width="50%">
      <img src="./docs/readme-assets/demo_diagram4.png" alt="Environmental Protection and Sustainable Development" />
      <br />
      <strong>Environmental Protection and Sustainable Development</strong>
    </td>
  </tr>
</table>

## 📌 Overview

MatePPT is not positioned as a standalone editor kernel. It is closer to a product-facing AI PPT web application.

It is better suited for scenarios such as:

- AI PPT product frontends
- Web applications with login, project management, and template workflow
- Frontend projects that continue extending business capabilities on top of an existing editor

If what you need is only a minimal pure editor, or a project that never connects to backend APIs, this repository will likely need further trimming for your own scenario.


<a id="features"></a>

## ✨ Features

### Product Flow

- `Topic Input`: enter a topic or requirement and start the AI PPT creation flow
- `Project Creation`: create a PPT project and continue into the editing workflow
- `Template Selection`: browse, choose, and apply templates
- `Work Management`: view historical projects and continue editing or previewing
- `Detail Flow`: move across outline, template, editing, and preview pages

### Editing Capabilities

- `Classic Editor`: keeps a full PPT editing main interface
- `Page Management`: supports adding, deleting, reordering, and switching pages
- `Element Editing`: text, images, shapes, tables, charts, multimedia, and more
- `Style Adjustments`: theme, palette, layout, and basic style configuration
- `Export Entry`: keeps export and preview related capabilities available

## 🧰 Tech Stack

- `React 18`
- `Umi 4`
- `TypeScript`
- `Ant Design`
- `Zustand`
- `React Query`
- `Tailwind CSS`

<a id="quick-start"></a>

## 🚀 Quick Start

### Requirements

- `Node.js >= 20`
- `pnpm >= 10`

### Install Dependencies

```bash
corepack pnpm install
```

### Start Development Server

```bash
corepack pnpm dev
```

Default local address:

```text
http://localhost:8000
```

### Production Build

```bash
corepack pnpm build
```

## 🔌 Backend Configuration

This project requests backend APIs during runtime. The common integration approaches are:

1. Use the `proxy` configuration in `.umirc.ts` during local development
2. Explicitly specify the backend base URL

For example, in PowerShell:

```powershell
$env:UMI_API_BASE="http://your-api-host"
corepack pnpm dev
```

If there is no available backend, the frontend can still start, but login, project creation, AI PPT generation, and related features will not work properly.

## 🗂️ Project Structure

```text
MatePPT/
├── public/          # Static assets
├── src/
│   ├── pages/       # Page entries
│   ├── components/  # Shared and business components
│   ├── services/    # Request service layer
│   ├── stores/      # State management
│   ├── ppt/         # PPT editor core
│   ├── routes/      # Route configuration
│   └── config/      # Runtime configuration
├── .umirc.ts        # Umi config
└── package.json
```

## 🤝 Contributing

Issues and Pull Requests are welcome.

Suggested flow:

1. Fork this repository
2. Create a feature branch
3. Finish your changes and validate locally
4. Open a Pull Request

Before submitting, it is recommended to run at least once:

```bash
corepack pnpm build
```

## 📜 License

This project is open-sourced under the `AGPL-3.0` license. See [LICENSE](./LICENSE) for details.

## 📮 Contact

For discussion, collaboration, or project-related questions, feel free to reach out via:

- `bubuxiu@gmail.com`

If you would like to join the WeChat group, scan the QR code below:

<p align="center">
  <img src="./docs/readme-assets/微信图片_20260409120240_543_142.jpg" alt="MatePPT WeChat Group" width="280" />
</p>
