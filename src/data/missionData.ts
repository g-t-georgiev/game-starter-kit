interface MissionData {
  killCount: number;
  surviveTime: number;
  /**
   * Value is count as milliseconds. It reflects the duration of the mission
   * data message on screen at the beginning of the game or after an update.
   */
  displayDuration: number;
}

export default {
  killCount: 20,
  surviveTime: 60,
  displayDuration: 4000,
} satisfies MissionData;
