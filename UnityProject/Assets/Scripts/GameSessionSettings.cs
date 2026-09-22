namespace PenguinSnowball
{
    public enum BattleDifficulty
    {
        Easy,
        Normal,
        Hard
    }

    public static class GameSessionSettings
    {
        public static BattleDifficulty Difficulty { get; set; } = BattleDifficulty.Normal;
        public static int DurationSeconds { get; set; } = 180;
    }
}
