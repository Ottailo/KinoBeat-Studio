import { NextResponse } from 'next/server';
import { compileMcslaPrompt } from '@/lib/models/promptEngine';
import { VIDEO_MODELS } from '@/lib/models/modelRegistry';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modelId, subject, action, look, cameraPresetId, soulId } = body;

    if (!modelId || !subject) {
      return NextResponse.json(
        { error: 'Missing required parameters: modelId and subject are mandatory.' },
        { status: 400 }
      );
    }

    const modelSpec = VIDEO_MODELS[modelId] || VIDEO_MODELS.flux_video;

    // Compile prompt according to MCSLA formula
    const compiled = compileMcslaPrompt({
      modelId,
      subject,
      action: action || 'cinematic motion with dynamic lighting',
      look: look || '35mm anamorphic prime lens, ARRI Alexa LF',
      cameraPresetId: cameraPresetId || 'orbital_drift',
      soulId,
    });

    return NextResponse.json({
      success: true,
      jobId: `kb-gen-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      model: modelSpec.name,
      provider: modelSpec.provider,
      compiledPrompt: compiled.fullPrompt,
      cameraDirective: compiled.cameraDirective,
      negativePrompt: compiled.negativePrompt,
      parameters: compiled.parameters,
      estimatedLatencyMs: 3200,
      status: 'queued',
      message: 'Video generation dispatched to DiT inference pipeline.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process video generation request.', details: String(error) },
      { status: 500 }
    );
  }
}
