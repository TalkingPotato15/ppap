"use client";

import { useState } from "react";
import type { ImplementationResources as IResources } from "@/types";
import CodeBlock from "./CodeBlock";

interface ImplementationResourcesProps {
  resources: IResources;
  onClose: () => void;
}

type TabId = "quickstart" | "config" | "files" | "customize";

export default function ImplementationResources({
  resources,
  onClose,
}: ImplementationResourcesProps) {
  const [activeTab, setActiveTab] = useState<TabId>("quickstart");
  const [selectedFile, setSelectedFile] = useState(0);

  const tabs: { id: TabId; label: string }[] = [
    { id: "quickstart", label: "Quick Start" },
    { id: "config", label: "Agent Config" },
    { id: "files", label: "Template Files" },
    { id: "customize", label: "Customize" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {resources.ideaTitle}
            </h2>
            <p className="text-sm text-gray-500">Implementation Resources</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tech Stack Pills */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex gap-2 flex-wrap flex-shrink-0">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Next.js
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            TypeScript
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Tailwind CSS
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            OpenAI
          </span>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 flex-shrink-0">
          <nav className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "quickstart" && (
            <QuickStartTab resources={resources} />
          )}
          {activeTab === "config" && <ConfigTab resources={resources} />}
          {activeTab === "files" && (
            <FilesTab
              files={resources.template.files}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          )}
          {activeTab === "customize" && (
            <CustomizeTab resources={resources} />
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStartTab({ resources }: { resources: IResources }) {
  return (
    <div className="space-y-6">
      {/* Setup Commands */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Installation Commands
        </h3>
        <div className="space-y-3">
          {resources.template.setupCommands.map((cmd, idx) => (
            <CodeBlock
              key={idx}
              code={cmd}
              language="bash"
              filename={`Step ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Environment Variables */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Environment Variables
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Variable
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Required
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resources.template.envVariables.map((env, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">
                    {env.key}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        env.required
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {env.required ? "Required" : "Optional"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{env.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Start Steps */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Setup Steps
        </h3>
        <ol className="space-y-4">
          {resources.quickStartGuide.map((step) => (
            <li key={step.order} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {step.order}
              </span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{step.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                {step.command && (
                  <div className="mt-2">
                    <CodeBlock code={step.command} language="bash" />
                  </div>
                )}
                {step.notes && step.notes.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                    {step.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function ConfigTab({ resources }: { resources: IResources }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resources.agentConfigJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([resources.agentConfigJson], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          agent-config.json
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              copied
                ? "bg-green-50 border-green-200 text-green-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {copied ? "복사됨!" : "복사"}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다운로드
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
        이 파일을{" "}
        <code className="bg-blue-100 px-1 rounded">public/agent-config.json</code>
        에 저장하세요. JSON 내용을 수정하면 앱의 성격이 바뀝니다!
      </div>

      <CodeBlock
        code={resources.agentConfigJson}
        language="json"
        filename="agent-config.json"
      />

      {/* Config Preview */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-800">설정 미리보기</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">에이전트 이름:</span>
            <span className="ml-2 font-medium">
              {resources.agentConfig.agent.name}
            </span>
          </div>
          <div>
            <span className="text-gray-500">말투:</span>
            <span className="ml-2">{resources.agentConfig.agent.tone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">환영 메시지:</span>
            <p className="mt-1 text-gray-700">
              {resources.agentConfig.prompts.welcome}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">테마 색상:</span>
          <div
            className="w-8 h-8 rounded border border-gray-200"
            style={{ backgroundColor: resources.agentConfig.ui.primaryColor }}
            title="Primary Color"
          />
          <div
            className="w-8 h-8 rounded border border-gray-200"
            style={{ backgroundColor: resources.agentConfig.ui.accentColor }}
            title="Accent Color"
          />
        </div>
      </div>
    </div>
  );
}

function FilesTab({
  files,
  selectedFile,
  onSelectFile,
}: {
  files: IResources["template"]["files"];
  selectedFile: number;
  onSelectFile: (idx: number) => void;
}) {
  const currentFile = files[selectedFile];

  return (
    <div className="flex gap-4 h-[500px]">
      {/* File List */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
          Files
        </h3>
        <ul className="space-y-1">
          {files.map((file, idx) => (
            <li key={idx}>
              <button
                onClick={() => onSelectFile(idx)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedFile === idx
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="font-mono text-xs truncate">{file.path}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-hidden">
        {currentFile && (
          <CodeBlock
            code={currentFile.content}
            language={currentFile.language}
            filename={currentFile.filename}
            description={currentFile.description}
          />
        )}
      </div>
    </div>
  );
}

function CustomizeTab({ resources }: { resources: IResources }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resources.customizationPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          ChatGPT로 커스터마이징하기
        </h3>
        <p className="text-gray-600 text-sm">
          아래 프롬프트를 ChatGPT에 붙여넣고, 원하는 변경사항을 입력하세요.
          ChatGPT가 수정된 JSON을 생성해줍니다.
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-700">
        <strong>팁:</strong> &quot;환영 메시지를 더 친근하게&quot;, &quot;색상을
        빨간색 계열로&quot;, &quot;예시 질문을 5개로 늘려줘&quot; 등의 요청을
        추가하세요.
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            copied
              ? "bg-green-50 border-green-200 text-green-600"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {copied ? "복사됨!" : "프롬프트 복사"}
        </button>
      </div>

      <CodeBlock
        code={resources.customizationPrompt}
        language="text"
        filename="ChatGPT Prompt"
        description="이 프롬프트를 ChatGPT에 붙여넣으세요"
      />
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
