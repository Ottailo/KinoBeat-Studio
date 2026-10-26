'use client';

import React, { useCallback } from 'react';
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
            style: { stroke: '#3E4D6D', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddNode = (type: 'promptNode' | 'cameraNode' | 'modelNode' | 'audioNode' | 'timelineNode') => {
    const id = `node-${type}-${Date.now()}`;
    const xPos = 180 + Math.random() * 200;
    const yPos = 120 + Math.random() * 200;

    const newNode: Node = {
      id,
      type,
      position: { x: xPos, y: yPos },
      data: {
        label: type.toUpperCase(),
        ...(type === 'promptNode' && {
          subject: 'Architectural interior of an obsidian brutalist gallery with diffused volumetric skylight',
          action: 'camera smoothly tracking past floating kinetic sculptures',
          look: '35mm Anamorphic, ARRI Alexa LF',
          soulId: 'EX-900',
          negativePrompt: 'blurry, distorted, watermarks',
        }),
        ...(type === 'cameraNode' && {
          presetId: 'orbital_drift',
          name: '360° Orbital Drift',
          category: 'Arc / Orbit',
          speedRamp: 1.0,
          focalLength: '35mm',
        }),
        ...(type === 'modelNode' && {
          modelId: 'flux_video',
          resolution: '1080p',
          aspectRatio: '16:9',
          fps: 30,
          cfg: 4.5,
          steps: 35,
        }),
        ...(type === 'audioNode' && {
          trackId: 'cyberpunk-neon-drift',
          title: 'Neon Drift 2088',
          bpm: 120,
          energy: 0.90,
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
    <div className="relative w-full h-full bg-[#0B0E14]">
      {/* Sleek Top Toolbar */}
      <NodeToolbar onAddNode={handleAddNode} onLoadPreset={handleLoadPreset} />

      {/* React Flow Canvas */}
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
        defaultViewport={{ x: 60, y: 50, zoom: 0.85 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#161B26"
        />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          nodeColor={() => '#1E2638'}
          maskColor="rgba(11, 14, 20, 0.8)"
          position="bottom-right"
          style={{ width: 130, height: 80, backgroundColor: '#0B0E14' }}
        />
      </ReactFlow>
    </div>
  );
};
