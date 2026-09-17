const API_URL = "http://127.0.0.1:8000";

export interface ActivityData {
    wpm: number;
    language: string;
    state: string;
    pauseDuration: number;
}

export interface MusicParameters {
    genre: string;
    bpm: number;
    mood: string;
}

export interface ActivityResponse {
    success: boolean;

    activity: ActivityData;

    music: MusicParameters;
}


export async function sendActivity(
    activity: ActivityData
): Promise<ActivityResponse | null> {

    try {

        const response = await fetch(
            `${API_URL}/activity`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(activity)
            }
        );

        if (!response.ok) {

            console.error(
                "TerminalVibes API error:",
                response.status
            );

            return null;
        }

        const data: ActivityResponse =
            await response.json();

        console.log(
            "🎵 TerminalVibes music:",
            data.music
        );

        return data;

    } catch (error) {

        console.error(
            "❌ Could not connect to Music Engine:",
            error
        );

        return null;
    }
}