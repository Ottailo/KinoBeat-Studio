'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';

import { PromptNode } from './nodes/PromptNode';
import { CameraNode } from './nodes/CameraNode';
import { ModelNode } from './nodes/ModelNode';
import { AudioNode } from './nodes/AudioNode';
import { RemotionTimelineNode } from './nodes/RemotionTimelineNode';
import { NodeToolbar } from './NodeToolbar';
import { useStudioStore } from '../../lib/store/studioStore';

const nodeTypes = {
  promptNode: PromptNode,
  cameraNode: CameraNode,
  modelNode: ModelNode,
  audioNode: AudioNode,
  timelineNode: RemotionTimelineNode,
};

const StudioCanvasInner: React.FC = () => {
  const nodes = useStudioStore((s) => s.nodes);
  const edges = useStudioStore((s) => s.edges);
  const onNodesChange = useStudioStore((s) => s.onNodesChange);
  const onEdgesChange = useStudioStore((s) => s.onEdgesChange);
  const onConnect = useStudioStore((s) => s.onConnect);
  const addNode = useStudioStore((s) => s.addNode);
  const removeNode = useStudioStore((s) => s.removeNode);
  const setSelectedNodeId = useStudioStore((s) => s.setSelectedNodeId);
  const loadPresetWorkflow = useStudioStore((s) => s.loadPresetWorkflow);

  const { setCenter, fitView, getNodes } = useReactFlow();

  const handleFocusOrAddNode = useCallback(
    (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode') => {
      const existing = getNodes().find((n) => n.type === type);
      if (existing) {
        setSelectedNodeId(existing.id);
        const w = 170;
        const h = 130;
        setCenter(existing.position.x + w, existing.position.y + h, { zoom: 0.95, duration: 400 });
      } else {
        addNode(type);
      }
    },
    [getNodes, setCenter, setSelectedNodeId, addNode]
  );

  const handleFitView = useCallback(() => {
    fitView({ duration: 400 });
  }, [fitView]);

  const handleLoadPreset = useCallback(
    (presetKey: string) => {
      loadPresetWorkflow(presetKey);
    },
    [loadPresetWorkflow]
  );

  return (
    <div className="relative w-full h-full bg-[#080A0F] studio-film-grain select-none">
      {/* Floating Studio Nodes Toolbar */}
      <NodeToolbar
        onAddNode={handleFocusOrAddNode}
        onLoadPreset={handleLoadPreset}
        onFitView={handleFitView}
      />

      {/* Reactive Multi-Model Graph Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        onNodesDelete={(deleted) => deleted.forEach((n) => removeNode(n.id))}
        deleteKeyCode={['Backspace', 'Delete']}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 60, y: 50, zoom: 0.85 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#161E2E"
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!bg-[#0D1117] !border-[#1A2130] !shadow-xl"
        />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'promptNode':
                return '#00F0FF';
              case 'cameraNode':
                return '#FFB800';
              case 'modelNode':
                return '#10B981';
              case 'audioNode':
                return '#F43F5E';
              case 'timelineNode':
                return '#A855F7';
              default:
                return '#1E2638';
            }
          }}
          maskColor="rgba(8, 10, 15, 0.88)"
          position="bottom-right"
          style={{
            width: 145,
            height: 90,
            backgroundColor: '#080A0F',
            border: '1px solid #1A2130',
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export const StudioCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <StudioCanvasInner />
    </ReactFlowProvider>
  );
};
