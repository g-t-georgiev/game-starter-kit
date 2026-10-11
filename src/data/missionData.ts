interface MissionData {
  killCount: number;
  surviveTime: number;
  /**
   * Value is count as seconds. It reflects the duration of the mission
   * data message on screen at the beginning of the game or after an update.
   */
  displayDuration: number;
}

const missionData: MissionData = {
  killCount: 20,
  surviveTime: 120,
  displayDuration: 15,
}

export default missionData;
