using System;
using System.Collections.Generic;
using UnityEngine;

namespace PenguinSnowball
{
    public enum PenguinType { Small, Gentoo, Chinstrap, Emperor, King }

    [Serializable]
    public struct PenguinStats
    {
        public PenguinType type;
        public int cost;
        public float hp;
        public float moveSpeed;
        public float attackRange;
        public float snowballMakeSeconds;
        public float throwWindupSeconds;
        public float damage;
        public float projectileSpeed;
    }

    public sealed class PenguinBattleController : MonoBehaviour
    {
        public static PenguinBattleController Instance { get; private set; }

        [Header("Battle")]
        [SerializeField] private Transform playerSpawnRoot;
        [SerializeField] private Transform enemySpawnRoot;
        [SerializeField] private PenguinUnit[] unitPrefabs;
        [SerializeField] private SnowballProjectile snowballPrefab;
        [SerializeField] private IglooBase playerBase;
        [SerializeField] private IglooBase enemyBase;

        [Header("Resources")]
        [SerializeField] private int maxCost = 10;
        [SerializeField] private int startingCost = 4;
        [SerializeField] private float costPerSecond = .85f;
        [SerializeField] private float cheerDecayPerSecond = 1.15f;
        [SerializeField] private float maxCheer = 12f;
        [SerializeField] private float maxCheerCraftMultiplier = 2.5f;

        [Header("Enemy AI")]
        [SerializeField] private float enemySpawnBaseInterval = 2.6f;
        [SerializeField] private Vector2 enemySpawnYRange = new(-1.8f, 1.5f);

        [Header("Units")]
        [SerializeField] private PenguinStats[] unitStats =
        {
            new PenguinStats { type = PenguinType.Small, cost = 1, hp = 80, moveSpeed = 1.9f, attackRange = 2.1f, snowballMakeSeconds = 1.1f, throwWindupSeconds = .28f, damage = 15, projectileSpeed = 6.5f },
            new PenguinStats { type = PenguinType.Gentoo, cost = 3, hp = 150, moveSpeed = 2.8f, attackRange = 2f, snowballMakeSeconds = 1.2f, throwWindupSeconds = .3f, damage = 30, projectileSpeed = 7f },
            new PenguinStats { type = PenguinType.Chinstrap, cost = 5, hp = 180, moveSpeed = 1.45f, attackRange = 4.2f, snowballMakeSeconds = 1.8f, throwWindupSeconds = .36f, damage = 45, projectileSpeed = 6f },
            new PenguinStats { type = PenguinType.Emperor, cost = 7, hp = 480, moveSpeed = 1.05f, attackRange = 2.3f, snowballMakeSeconds = 2.2f, throwWindupSeconds = .46f, damage = 65, projectileSpeed = 5.5f },
            new PenguinStats { type = PenguinType.King, cost = 10, hp = 950, moveSpeed = .85f, attackRange = 3.2f, snowballMakeSeconds = 2.6f, throwWindupSeconds = .62f, damage = 110, projectileSpeed = 5.1f },
        };

        public event Action<int, int> CostChanged;
        public event Action<float, float> CheerChanged;
        public event Action<int, int> BaseHpChanged;
        public event Action<int> TimeChanged;
        public event Action<PenguinType?> SelectionChanged;
        public event Action<bool> MatchEnded;

        public int CurrentCost { get; private set; }
        public int MaxCost => maxCost;
        public float Cheer { get; private set; }
        public float MaxCheer => maxCheer;
        public PenguinType? SelectedType { get; private set; }
        public int RemainingSeconds => Mathf.Max(0, Mathf.CeilToInt(remainingTime));
        public int PlayerBaseHp => playerBase == null ? 0 : Mathf.CeilToInt(playerBase.Hp);
        public int EnemyBaseHp => enemyBase == null ? 0 : Mathf.CeilToInt(enemyBase.Hp);

        public float SnowballCraftMultiplier
        {
            get
            {
                var normalized = maxCheer <= 0 ? 0 : Mathf.Clamp01(Cheer / maxCheer);
                return Mathf.Lerp(1f, maxCheerCraftMultiplier, normalized);
            }
        }

        private readonly Dictionary<PenguinType, PenguinStats> statsByType = new();
        private float costAccumulator;
        private float enemyCost;
        private float enemyCostAccumulator;
        private float enemySpawnTimer;
        private float remainingTime;
        private int lastReportedSecond = -1;
        private bool finished;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            CurrentCost = startingCost;
            enemyCost = startingCost;
            remainingTime = Mathf.Max(1, GameSessionSettings.DurationSeconds);

            statsByType.Clear();
            foreach (var stats in unitStats)
                statsByType[stats.type] = stats;
        }

        private void Start()
        {
            playerBase?.Configure(true, 40f);
            enemyBase?.Configure(false, 40f);
            playerBase?.Changed += OnBaseChanged;
            enemyBase?.Changed += OnBaseChanged;

            CostChanged?.Invoke(CurrentCost, maxCost);
            CheerChanged?.Invoke(Cheer, maxCheer);
            BaseHpChanged?.Invoke(PlayerBaseHp, EnemyBaseHp);
            ReportTime(true);
        }

        private void OnDestroy()
        {
            if (playerBase != null) playerBase.Changed -= OnBaseChanged;
            if (enemyBase != null) enemyBase.Changed -= OnBaseChanged;
            if (Instance == this) Instance = null;
        }

        private void Update()
        {
            if (finished)
                return;

            TickTimer();
            TickPlayerResources();
            TickEnemyAi();
        }

        private void TickTimer()
        {
            remainingTime -= Time.deltaTime;
            ReportTime(false);

            if (remainingTime > 0f)
                return;

            var playerWon = EnemyBaseHp < PlayerBaseHp;
            FinishMatch(playerWon);
        }

        private void ReportTime(bool force)
        {
            var second = RemainingSeconds;
            if (!force && second == lastReportedSecond)
                return;

            lastReportedSecond = second;
            TimeChanged?.Invoke(second);
        }

        private void TickPlayerResources()
        {
            costAccumulator += costPerSecond * Time.deltaTime;
            if (costAccumulator >= 1f && CurrentCost < maxCost)
            {
                var add = Mathf.FloorToInt(costAccumulator);
                costAccumulator -= add;
                CurrentCost = Mathf.Min(maxCost, CurrentCost + add);
                CostChanged?.Invoke(CurrentCost, maxCost);
            }

            if (Cheer > 0f)
            {
                Cheer = Mathf.Max(0f, Cheer - cheerDecayPerSecond * Time.deltaTime);
                CheerChanged?.Invoke(Cheer, maxCheer);
            }
        }

        private void TickEnemyAi()
        {
            var difficultyCostScale = GameSessionSettings.Difficulty switch
            {
                BattleDifficulty.Easy => .72f,
                BattleDifficulty.Hard => 1.22f,
                _ => 1f
            };

            enemyCostAccumulator += costPerSecond * difficultyCostScale * Time.deltaTime;
            if (enemyCostAccumulator >= 1f && enemyCost < maxCost)
            {
                var add = Mathf.FloorToInt(enemyCostAccumulator);
                enemyCostAccumulator -= add;
                enemyCost = Mathf.Min(maxCost, enemyCost + add);
            }

            enemySpawnTimer -= Time.deltaTime;
            if (enemySpawnTimer > 0f)
                return;

            var intervalScale = GameSessionSettings.Difficulty switch
            {
                BattleDifficulty.Easy => 1.28f,
                BattleDifficulty.Hard => .72f,
                _ => 1f
            };

            enemySpawnTimer = enemySpawnBaseInterval * intervalScale * UnityEngine.Random.Range(.75f, 1.2f);
            SpawnEnemyAffordable();
        }

        private void SpawnEnemyAffordable()
        {
            var candidates = new List<PenguinType>();
            foreach (var pair in statsByType)
                if (pair.Value.cost <= enemyCost)
                    candidates.Add(pair.Key);

            if (candidates.Count == 0)
                return;

            candidates.Sort((a, b) => statsByType[a].cost.CompareTo(statsByType[b].cost));

            var difficultyBias = GameSessionSettings.Difficulty == BattleDifficulty.Hard ? .78f : .55f;
            var index = UnityEngine.Random.value < difficultyBias
                ? UnityEngine.Random.Range(Mathf.Max(0, candidates.Count - 2), candidates.Count)
                : UnityEngine.Random.Range(0, candidates.Count);

            var type = candidates[index];
            var stats = statsByType[type];
            var prefab = FindPrefab(type);
            if (prefab == null)
                return;

            enemyCost -= stats.cost;
            var position = enemySpawnRoot != null ? enemySpawnRoot.position : new Vector3(6.2f, 1.2f, 0f);
            position.y = UnityEngine.Random.Range(enemySpawnYRange.x, enemySpawnYRange.y);

            var unit = Instantiate(prefab, position, Quaternion.identity, enemySpawnRoot);
            unit.Initialize(this, stats, false, snowballPrefab);
        }

        public PenguinStats GetStats(PenguinType type) => statsByType[type];

        public void Select(PenguinType type)
        {
            if (!statsByType.TryGetValue(type, out var stats) || CurrentCost < stats.cost)
                return;

            SelectedType = SelectedType == type ? null : type;
            SelectionChanged?.Invoke(SelectedType);
        }

        public void CancelSelection()
        {
            SelectedType = null;
            SelectionChanged?.Invoke(null);
        }

        public bool TrySpawnSelected(Vector3 worldPosition)
        {
            if (finished || SelectedType is not PenguinType type)
                return false;

            var stats = statsByType[type];
            if (CurrentCost < stats.cost)
                return false;

            var prefab = FindPrefab(type);
            if (prefab == null)
                return false;

            CurrentCost -= stats.cost;
            CostChanged?.Invoke(CurrentCost, maxCost);

            var unit = Instantiate(prefab, worldPosition, Quaternion.identity, playerSpawnRoot);
            unit.Initialize(this, stats, true, snowballPrefab);
            CancelSelection();
            return true;
        }

        public void TapCheer()
        {
            if (finished)
                return;

            Cheer = Mathf.Min(maxCheer, Cheer + 1f);
            CheerChanged?.Invoke(Cheer, maxCheer);
        }

        public void NotifyBaseDestroyed(IglooBase destroyedBase)
        {
            if (finished)
                return;

            FinishMatch(!destroyedBase.IsPlayer);
        }

        private void FinishMatch(bool playerWon)
        {
            finished = true;
            SelectedType = null;
            SelectionChanged?.Invoke(null);
            MatchEnded?.Invoke(playerWon);
        }

        private void OnBaseChanged(IglooBase _)
        {
            BaseHpChanged?.Invoke(PlayerBaseHp, EnemyBaseHp);
        }

        private PenguinUnit FindPrefab(PenguinType type)
        {
            if (unitPrefabs == null)
                return null;

            foreach (var prefab in unitPrefabs)
                if (prefab != null && prefab.Type == type)
                    return prefab;

            return null;
        }
    }
}
