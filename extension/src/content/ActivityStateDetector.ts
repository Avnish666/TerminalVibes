import { ActivityState } from "./ActivityState";

export class ActivityStateDetector {

  detect(pauseDuration: number): ActivityState {

    if (pauseDuration >= 2) {
      return ActivityState.THINKING;
    }

    return ActivityState.ACTIVE;
  }
}