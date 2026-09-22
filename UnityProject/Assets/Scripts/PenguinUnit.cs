using UnityEngine;

namespace PenguinSnowball
{
    public sealed class PenguinUnit : MonoBehaviour
    {
        private enum UnitState { Walking, MakingSnowball, Throwing, Defeated }

        [SerializeField] private PenguinType type;
        [SerializeField] private Animator animator;
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private Transform visualRoot;
        [SerializeField] private Transform throwOrigin;
        [SerializeField] private GameObject heldSnowball;
        [SerializeField] private Material enemyRecolorMaterial;
        [SerializeField] private LayerMask targetMask = ~0;

        public PenguinType Type => type;
        public bool IsPlayer { get; private set; }
        public float Hp { get; private set; }

        private PenguinBattleController battle;
        private PenguinStats stats;
        private SnowballProjectile projectilePrefab;
        private UnitState state;
        private Transform target;
        private float stateTime;

        private static readonly int WalkHash = Animator.StringToHash("Walk");
        private static readonly int MakeHash = Animator.StringToHash("MakeSnowball");
        private static readonly int ThrowHash = Animator.StringToHash("Throw");
        private static readonly int HitHash = Animator.StringToHash("Hit");
        private static readonly int DefeatHash = Animator.StringToHash("Defeat");

        public void Initialize(
            PenguinBattleController controller,
            PenguinStats unitStats,
            bool isPlayer,
            SnowballProjectile snowballPrefab)
        {
            battle = controller;
            stats = unitStats;
            type = unitStats.type;
            IsPlayer = isPlayer;
            Hp = stats.hp;
            projectilePrefab = snowballPrefab;
            state = UnitState.Walking;

            if (!isPlayer && spriteRenderer != null && enemyRecolorMaterial != null)
                spriteRenderer.material = enemyRecolorMaterial;

            var scale = transform.localScale;
            scale.x = Mathf.Abs(scale.x) * (isPlayer ? 1f : -1f);
            transform.localScale = scale;

            if (heldSnowball != null)
                heldSnowball.SetActive(false);

            animator?.SetBool(WalkHash, true);
        }

        private void Update()
        {
            if (state == UnitState.Defeated)
                return;

            if (target == null || !target.gameObject.activeInHierarchy)
                target = FindTarget();

            if (target == null)
            {
                WalkForward();
                return;
            }

            var distance = Mathf.Abs(target.position.x - transform.position.x);
            if (distance > stats.attackRange)
            {
                WalkForward();
                return;
            }

            if (state == UnitState.Walking)
                BeginMaking();

            TickCombat();
        }

        private void WalkForward()
        {
            state = UnitState.Walking;
            animator?.SetBool(WalkHash, true);

            if (heldSnowball != null)
                heldSnowball.SetActive(false);

            var direction = IsPlayer ? Vector3.right : Vector3.left;
            transform.position += direction * (stats.moveSpeed * Time.deltaTime);
        }

        private void BeginMaking()
        {
            state = UnitState.MakingSnowball;
            stateTime = 0f;
            animator?.SetBool(WalkHash, false);
            animator?.SetTrigger(MakeHash);

            if (heldSnowball != null)
            {
                heldSnowball.SetActive(true);
                heldSnowball.transform.localScale = Vector3.one * .25f;
            }
        }

        private void TickCombat()
        {
            stateTime += Time.deltaTime;

            if (state == UnitState.MakingSnowball)
            {
                var craftMultiplier = battle != null ? battle.SnowballCraftMultiplier : 1f;
                var duration = stats.snowballMakeSeconds / Mathf.Max(.1f, craftMultiplier);
                var progress = Mathf.Clamp01(stateTime / duration);

                if (heldSnowball != null)
                {
                    var pulse = 1f + Mathf.Sin(Time.time * 18f) * .04f;
                    heldSnowball.transform.localScale = Vector3.one * Mathf.Lerp(.25f, 1f, progress) * pulse;
                }

                if (stateTime >= duration)
                {
                    state = UnitState.Throwing;
                    stateTime = 0f;
                    animator?.SetTrigger(ThrowHash);
                }

                return;
            }

            if (state == UnitState.Throwing && stateTime >= stats.throwWindupSeconds)
            {
                Throw();
                BeginMaking();
            }
        }

        private Transform FindTarget()
        {
            var origin = (Vector2)transform.position;
            var hits = Physics2D.OverlapCircleAll(origin, stats.attackRange * 1.15f, targetMask);

            Transform best = null;
            var bestDistance = float.MaxValue;

            foreach (var hit in hits)
            {
                var other = hit.GetComponentInParent<PenguinUnit>();
                if (other != null && other != this && other.IsPlayer != IsPlayer)
                {
                    var dx = other.transform.position.x - transform.position.x;
                    if ((IsPlayer && dx >= 0f) || (!IsPlayer && dx <= 0f))
                    {
                        var distance = Mathf.Abs(dx);
                        if (distance < bestDistance)
                        {
                            bestDistance = distance;
                            best = other.transform;
                        }
                    }
                }

                var igloo = hit.GetComponentInParent<IglooBase>();
                if (igloo != null && igloo.IsPlayer != IsPlayer && !igloo.IsDestroyed)
                {
                    var dx = igloo.transform.position.x - transform.position.x;
                    if ((IsPlayer && dx >= 0f) || (!IsPlayer && dx <= 0f))
                    {
                        var distance = Mathf.Abs(dx);
                        if (distance < bestDistance)
                        {
                            bestDistance = distance;
                            best = igloo.transform;
                        }
                    }
                }
            }

            return best;
        }

        private void Throw()
        {
            if (target == null || projectilePrefab == null)
                return;

            var origin = throwOrigin != null ? throwOrigin.position : transform.position;
            var projectile = Instantiate(projectilePrefab, origin, Quaternion.identity);
            projectile.Launch(target, stats.damage, stats.projectileSpeed, IsPlayer);

            if (heldSnowball != null)
                heldSnowball.SetActive(false);
        }

        public void TakeDamage(float amount)
        {
            if (state == UnitState.Defeated)
                return;

            Hp -= amount;
            animator?.SetTrigger(HitHash);

            if (Hp > 0f)
                return;

            state = UnitState.Defeated;
            if (heldSnowball != null)
                heldSnowball.SetActive(false);

            animator?.SetBool(WalkHash, false);
            animator?.SetTrigger(DefeatHash);
            Destroy(gameObject, 1.1f);
        }
    }
}
