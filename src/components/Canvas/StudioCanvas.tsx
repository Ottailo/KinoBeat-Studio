'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';

import { PromptNode } from './nodes/PromptNode';
import { CameraNode } from './nodes/CameraNode';
import { ModelNode } from './nodes/ModelNode';
import { AudioNode } from './nodes/AudioNode';
import { RemotionTimelineNode } from './nodes/RemotionTimelineNode';
import { NodeToolbar } from './NodeToolbar';
import { INITIAL_NODES, INITIAL_EDGES } from '../../lib/store/studioStore';

const nodeTypes = {
  promptNode: PromptNode,
  cameraNode: CameraNode,
  modelNode: ModelNode,
  audioNode: AudioNode,
  timelineNode: RemotionTimelineNode,
};

export const StudioCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#00f0ff', strokeWidth: 2.5 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddNode = (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode') => {
    const id = `node-${type}-${Date.now()}`;
    const xPos = 200 + Math.random() * 200;
    const yPos = 150 + Math.random() * 200;

    const newNode: Node = {
      id,
      type,
      position: { x: xPos, y: yPos },
      data: {
        label: type.toUpperCase(),
        ...(type === 'promptNode' && {
          subject: 'Cybernetic explorer entering an ancient quantum archive',
          action: 'interfacing with luminous floating data crystals',
          look: '35mm Anamorphic, ARRI Alexa LF, Kodak Vision3 500T',
          soulId: 'EX-900',
          negativePrompt: 'blurry, distorted, watermarks',
        }),
        ...(type === 'cameraNode' && {
          presetId: 'fpv_dive',
          name: 'FPV Acro Dive',
          category: 'FPV',
          speedRamp: 1.5,
          focalLength: '24mm Ultra-Wide',
        }),
        ...(type === 'modelNode' && {
          modelId: 'kling_1_5',
          resolution: '1080p',
          aspectRatio: '16:9',
          fps: 30,
          cfg: 5.0,
          steps: 40,
        }),
        ...(type === 'audioNode' && {
          trackId: 'tokyo-drift-kinetic',
          title: 'Shibuya Speedrun',
          bpm: 140,
          energy: 0.95,
          isSynthesizing: false,
        }),
        ...(type === 'timelineNode' && {
          duration: 10,
          sceneCount: 3,
          renderEngine: 'Remotion 4.x',
        }),
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const handleLoadPreset = (presetKey: string) => {
    if (presetKey === 'cyberpunk_reel') {
      setNodes(INITIAL_NODES);
      setEdges(INITIAL_EDGES);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#090a0f]">
      {/* Top Floating Node Toolbar */}
      <NodeToolbar onAddNode={handleAddNode} onLoadPreset={handleLoadPreset} />

      {/* React Flow Infinite Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e2638"
        />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'promptNode') return '#00f0ff';
            if (n.type === 'cameraNode') return '#ff007f';
            if (n.type === 'modelNode') return '#38bdf8';
            if (n.type === 'audioNode') return '#f59e0b';
            return '#a855f7';
          }}
          maskColor="rgba(9, 10, 15, 0.7)"
          position="bottom-right"
          style={{ width: 140, height: 90 }}
        />
      </ReactFlow>
    </div>
  );
};
