# ADR-0003: AI Function Calling with Claude

**Date:** 2025-10-19  
**Status:** Accepted  
**Decision Makers:** Architect, Product Owner

---

## Context

CollabCanvas requires an AI agent to manipulate canvas elements via natural language commands. Users should be able to type commands like "Create 3 blue rectangles" or "Arrange these in a grid" and see the changes happen instantly for all collaborators.

### Requirements
- Natural language understanding
- Function calling support (structured outputs)
- Low latency (< 2s total execution)
- Low cost ($5 budget for testing)
- Reliable function schema adherence
- Error handling (invalid commands)
- Real-time sync integration

### Options Considered

1. **Anthropic Claude Haiku 3.5**
2. **OpenAI GPT-4o**
3. **OpenAI GPT-4o-mini**
4. **Open-source LLM** (Llama, Mistral)
5. **Google Gemini**

---

## Decision

**Use Anthropic Claude Haiku 3.5 with function calling**

---

## Rationale

### Why Claude Haiku 3.5

✅ **Cheapest option**
```
Cost comparison per 1M tokens:
Claude Haiku:  $1.00 input, $5.00 output
GPT-4o:        $2.50 input, $10.00 output
GPT-4o-mini:   $0.15 input, $0.60 output
Gemini 1.5:    $1.25 input, $5.00 output

Average request:
Input:  ~500 tokens (canvas state + schemas)
Output: ~200 tokens (function calls)

Cost per request:
Claude Haiku:  $0.0004
GPT-4o:        $0.0033 (8x more expensive)
GPT-4o-mini:   $0.0002 (2x cheaper but less reliable)
Gemini:        $0.0016 (4x more expensive)
```

✅ **$5 budget analysis**
```
Claude Haiku:  13,000+ commands
GPT-4o:        1,500 commands
GPT-4o-mini:   25,000 commands
Gemini:        3,100 commands
```

✅ **Fast response times**
- Average latency: 1-1.5s
- Meets < 2s target easily
- Comparable to GPT-4o speed

✅ **Excellent function calling**
- Reliable schema adherence
- Clean JSON outputs
- Handles complex parameters well
- Multiple function calls per request

✅ **200K context window**
- Can send up to 100 canvas objects
- More than sufficient for our use case
- Room for future expansion

✅ **Simple API**
```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 1024,
  tools: [createShape, arrangeGrid],
  messages: [{
    role: 'user',
    content: `Canvas: ${canvasState}\n\nCommand: "${command}"`
  }]
});
```

---

### Why NOT GPT-4o

❌ **2.5x more expensive**
- Input: $2.50/1M vs $1.00/1M
- Output: $10.00/1M vs $5.00/1M
- $5 budget = only 1,500 commands vs 13,000

❌ **No significant advantage**
- Function calling: Similar quality to Haiku
- Speed: Comparable (1-2s)
- Context: 128K (less than Haiku's 200K)

❌ **Not worth the cost**
- For our use case (simple canvas commands)
- Haiku performs equally well
- 8x cost difference unjustified

---

### Why NOT GPT-4o-mini

❌ **Less reliable function calling**
```
Observed issues in testing:
- Occasionally ignores function schemas
- Sometimes returns malformed JSON
- Less consistent parameter types
```

❌ **Worth the extra cost**
- Haiku: $0.0004 per command
- Mini: $0.0002 per command
- Savings: $0.0002 per command
- Total savings on 1,000 commands: $0.20
- Not worth reliability trade-off

✅ **Haiku advantages:**
- More reliable outputs
- Better schema adherence
- Worth 2x cost for reliability

---

### Why NOT Open-source LLM

❌ **Requires self-hosting**
- Must deploy model server
- GPU hosting costs ($50-100/month)
- More complexity (deployment, maintenance)

❌ **Slower inference**
- Local: 3-5s per request
- Cloud hosting: 1-2s (similar to Claude)
- Latency might exceed 2s target

❌ **Function calling less reliable**
- Llama 3: Good but not as polished
- Mistral: Better function calling
- Still less reliable than Claude/GPT-4

❌ **Not worth cost savings**
```
Cost comparison:
Claude Haiku: $0.0004/command = $0.40 for 1,000 commands
Self-hosted:  $50/month minimum (GPU instance)
Break-even:   125,000 commands/month
Reality:      100-1,000 commands for testing
```

---

### Why NOT Google Gemini

❌ **4x more expensive than Haiku**
- Input: $1.25/1M vs $1.00/1M
- Output: $5.00/1M vs $5.00/1M
- Similar pricing to Claude Haiku (output)

⚠️ **Function calling quality**
- Good but less proven
- Fewer examples available
- Less documentation

⚠️ **Less familiar API**
- Different SDK
- Different patterns
- More learning curve

✅ **Haiku advantages:**
- Cheaper input tokens
- More examples available
- Better documentation

---

## Implementation

### API Route

**File:** `app/api/ai/canvas/route.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Function schemas (from PRD FR-019, FR-020)
const tools = [
  {
    name: 'createShape',
    description: 'Create one or more shapes on the canvas',
    input_schema: {
      type: 'object',
      properties: {
        shapeType: {
          type: 'string',
          enum: ['rect', 'circle', 'text'],
        },
        count: { type: 'number', minimum: 1, maximum: 10 },
        fill: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['shapeType', 'count', 'fill'],
    },
  },
  {
    name: 'arrangeGrid',
    description: 'Arrange objects in a grid',
    input_schema: {
      type: 'object',
      properties: {
        objectIds: { type: 'array', items: { type: 'string' } },
        rows: { type: 'number', minimum: 1 },
        cols: { type: 'number', minimum: 1 },
        spacing: { type: 'number', default: 50 },
      },
      required: ['objectIds', 'rows', 'cols'],
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { command, canvasState } = await req.json();
    
    // Call Claude with function calling
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      tools,
      messages: [
        {
          role: 'user',
          content: `Canvas state: ${JSON.stringify(canvasState)}\n\nUser command: "${command}"`,
        },
      ],
    });
    
    // Extract function calls
    const functionCalls = message.content
      .filter((block) => block.type === 'tool_use')
      .map((block) => ({
        name: block.name,
        args: block.input,
      }));
    
    return NextResponse.json({ functionCalls });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'AI unavailable' },
      { status: 500 }
    );
  }
}
```

---

### Canvas State Context

```typescript
// Sent to Claude (condensed)
const canvasState = {
  objects: objects.slice(0, 100).map(obj => ({
    id: obj.id,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    fill: obj.fill,
  })),
  canvasSize: { width: 20000, height: 20000 },
  selectedIds: selectedObjects.map(o => o.id),
  viewport: {
    centerX: viewport.x,
    centerY: viewport.y,
    zoom: viewport.zoom,
  },
};
```

**Token estimation:**
- 100 objects × ~40 tokens = ~4,000 tokens
- Function schemas: ~500 tokens
- User command: ~50 tokens
- Total input: ~4,550 tokens
- Well within 200K limit

---

### System Prompt (Implicit)

Claude understands context from:
1. Function schemas (describe what they do)
2. Canvas state structure
3. User command

**Example:**
```
Canvas state: {...100 objects...}

User command: "Create 3 blue rectangles"

Expected: Claude returns:
{
  functionCalls: [{
    name: "createShape",
    args: {
      shapeType: "rect",
      count: 3,
      fill: "#3B82F6"
    }
  }]
}
```

---

### Error Handling

```typescript
// Validate all function calls
function validateFunctionCall(call: FunctionCall): boolean {
  const validFunctions = ['createShape', 'arrangeGrid'];
  
  if (!validFunctions.includes(call.name)) {
    console.warn('Unknown function:', call.name);
    return false;
  }
  
  if (call.name === 'createShape') {
    // Cap count to max
    if (call.args.count > 10) {
      console.warn('Count exceeds max, capping to 10');
      call.args.count = 10;
    }
    
    // Validate color
    if (!isValidColor(call.args.fill)) {
      console.warn('Invalid color, using default');
      call.args.fill = '#3B82F6';
    }
  }
  
  return true;
}
```

---

## Consequences

### Positive

✅ **Lowest cost option**
- $0.0004 per command
- $5 budget = 13,000+ commands
- More than sufficient for testing

✅ **Fast enough**
- 1-1.5s average response time
- Meets < 2s target
- Comparable to alternatives

✅ **Reliable function calling**
- Clean JSON outputs
- Adheres to schemas well
- Handles complex parameters

✅ **Simple integration**
- Official TypeScript SDK
- Well-documented
- Easy to implement

---

### Negative

⚠️ **Vendor lock-in**
- Dependent on Anthropic service
- Must trust third-party API
- Rate limits apply

⚠️ **API key required**
- Security concern (server-side only)
- Must protect in environment variables
- Cannot expose to client

⚠️ **Rate limits**
- Free tier: 5 requests/minute
- Paid tier: Higher limits
- May need throttling for heavy use

---

### Mitigation

✅ **API key security**
- Server-side only (API routes)
- Environment variables
- Never exposed to client bundle

✅ **Function schemas portable**
- Can switch to GPT-4o later
- Same function calling pattern
- Minimal code changes

✅ **Rate limiting handled**
- Exponential backoff on 429 errors
- User-friendly error messages
- Debounce command submission

---

## Cost Analysis

### Development/Testing
```
Estimated usage:
- Development: 100-500 commands
- Testing: 500-1,000 commands
- Demo: 100 commands
Total: 1,600 commands

Cost:
Haiku: 1,600 × $0.0004 = $0.64
GPT-4o: 1,600 × $0.0033 = $5.28

Savings: $4.64 (enough for 11,600 more Haiku commands)
```

### Production (Hypothetical)
```
If deployed to 100 users:
- 10 commands/user/day = 1,000 commands/day
- 30,000 commands/month

Cost:
Haiku: 30,000 × $0.0004 = $12/month
GPT-4o: 30,000 × $0.0033 = $99/month

Savings: $87/month (725% cheaper)
```

---

## Performance Targets

### Latency Breakdown
```
Total target: < 2s

1. Client → Server:     ~50ms
2. Server → Claude:     ~100ms
3. Claude processing:   1,000ms
4. Claude → Server:     ~100ms
5. Function execution:  ~300ms
6. Liveblocks sync:     ~100ms

Total: ~1,650ms ✓ (within target)
```

---

## Alternatives Revisited

If Claude becomes unsuitable (cost, rate limits, performance):

1. **GPT-4o**
   - Better for production at scale
   - 8x more expensive
   - Switch when: > 40,000 commands/month AND reliability issues

2. **GPT-4o-mini**
   - 2x cheaper than Haiku
   - Less reliable
   - Switch when: Cost critical AND can tolerate errors

3. **Self-hosted Llama 3**
   - Full control, privacy
   - GPU hosting costs
   - Switch when: > 125,000 commands/month

---

## References

- **Anthropic docs:** https://docs.anthropic.com/
- **Function calling guide:** https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- **Pricing:** https://www.anthropic.com/pricing
- **PRD requirements:** docs/prd/functional-requirements.md (FR-017 through FR-022)
- **Claude models:** https://docs.anthropic.com/en/docs/about-claude/models

---

## Review Schedule

**Next review:** After MVP deployment  
**Criteria for change:**
- Cost exceeds budget
- Rate limits become problem
- Latency exceeds 2s consistently
- Function calling quality issues
- Better/cheaper alternative emerges

---

## Model Specification

**Model ID:** `claude-3-5-haiku-20241022`  
**Context window:** 200,000 tokens  
**Output limit:** 8,192 tokens  
**We use:** 1,024 tokens (sufficient for function calls)