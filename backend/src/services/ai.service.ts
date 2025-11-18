import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface WeeklyWorkoutData {
  planned: any[];
  completed: any[];
  completionRate: number;
  avgRpe?: number;
  totalDistance?: number;
  totalDuration?: number;
  goal: string;
  weekNumber: number;
  totalWeeks: number;
}

export interface WorkoutAdjustment {
  reasoning: string;
  adjustments: {
    weekNumber: number;
    modifications: Array<{
      day: number;
      action: 'modify' | 'add' | 'remove';
      workout?: {
        sportType: string;
        workoutType: string;
        targetDuration?: number;
        targetDistance?: number;
        intensityZone?: string;
        description?: string;
      };
      reason: string;
    }>;
  };
  recommendations: string[];
}

export async function generateWorkoutAdjustments(
  weeklyData: WeeklyWorkoutData
): Promise<WorkoutAdjustment> {
  const prompt = buildAdjustmentPrompt(weeklyData);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Parse the AI response
  return parseAIResponse(responseText);
}

function buildAdjustmentPrompt(data: WeeklyWorkoutData): string {
  return `You are an expert endurance coach specializing in ${data.goal} training.

ATHLETE'S TRAINING PLAN:
- Goal: ${data.goal}
- Current Week: ${data.weekNumber} of ${data.totalWeeks}
- Race Date: ${data.totalWeeks - data.weekNumber} weeks away

WEEK ${data.weekNumber} PERFORMANCE:
- Completion Rate: ${data.completionRate.toFixed(1)}%
- Average RPE: ${data.avgRpe ? data.avgRpe.toFixed(1) : 'N/A'} / 10
- Total Distance: ${data.totalDistance ? data.totalDistance.toFixed(1) : 'N/A'} km
- Total Duration: ${data.totalDuration ? Math.round(data.totalDuration / 60) : 'N/A'} hours

PLANNED WORKOUTS:
${JSON.stringify(data.planned, null, 2)}

COMPLETED WORKOUTS:
${JSON.stringify(data.completed, null, 2)}

ANALYSIS REQUIRED:
1. Evaluate the athlete's performance this week
2. Identify signs of overtraining, undertraining, or optimal training
3. Assess recovery based on RPE and completion rate
4. Determine if adjustments are needed for next week

PROVIDE ADJUSTMENTS in the following JSON format:
{
  "reasoning": "Your analysis of the week's performance and rationale for adjustments",
  "adjustments": {
    "weekNumber": ${data.weekNumber + 1},
    "modifications": [
      {
        "day": 1,  // Day of week (0=Sunday, 6=Saturday)
        "action": "modify",  // "modify", "add", or "remove"
        "workout": {
          "sportType": "RUN",
          "workoutType": "EASY_RUN",
          "targetDuration": 60,
          "targetDistance": 10,
          "intensityZone": "ZONE_2",
          "description": "Easy recovery run"
        },
        "reason": "Reason for this specific change"
      }
    ]
  },
  "recommendations": [
    "General coaching advice and tips for the athlete"
  ]
}

COACHING GUIDELINES:
- For ${data.goal}:
  ${getGoalSpecificGuidelines(data.goal)}
- If completion rate < 80%, consider reducing volume or intensity
- If RPE consistently > 7, add more recovery
- If RPE consistently < 5 and completion is 100%, can gradually increase load
- Always prioritize injury prevention and sustainable progress
- Consider the training phase (base, build, peak, taper)

Respond ONLY with valid JSON.`;
}

function getGoalSpecificGuidelines(goal: string): string {
  switch (goal) {
    case 'HALF_MARATHON':
      return '- Focus on building endurance with long runs up to 16-18 km\n- Include 1-2 speed sessions per week\n- Weekly volume: 30-60 km';
    case 'MARATHON':
      return '- Build long runs up to 30-35 km\n- Include tempo runs and marathon pace work\n- Weekly volume: 50-100 km';
    case 'HALF_IRONMAN':
      return '- Swim: 2-3 sessions/week (1.9km race distance)\n- Bike: 2-3 sessions/week, long ride up to 90km\n- Run: 3-4 sessions/week, long run up to 16km\n- Include brick workouts (bike-to-run)';
    case 'IRONMAN':
      return '- Swim: 3-4 sessions/week (3.8km race distance)\n- Bike: 3-4 sessions/week, long ride up to 150km\n- Run: 3-5 sessions/week, long run up to 30km\n- Include brick workouts and practice race nutrition';
    default:
      return '';
  }
}

function parseAIResponse(response: string): WorkoutAdjustment {
  try {
    // Remove markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return a safe default
    return {
      reasoning: response,
      adjustments: {
        weekNumber: 0,
        modifications: [],
      },
      recommendations: ['Continue with the current plan'],
    };
  }
}
