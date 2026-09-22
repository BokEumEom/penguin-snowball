using UnityEngine;

namespace PenguinSnowball
{
    public sealed class SnowballProjectile : MonoBehaviour
    {
        [SerializeField] private float arcHeight = 1.2f;

        private Transform target;
        private Vector3 start;
        private float damage;
        private float speed;
        private float progress;
        private bool fromPlayer;

        public void Launch(Transform targetTransform, float hitDamage, float moveSpeed, bool isPlayer)
        {
            target = targetTransform;
            start = transform.position;
            damage = hitDamage;
            speed = Mathf.Max(.1f, moveSpeed);
            fromPlayer = isPlayer;
        }

        private void Update()
        {
            if (target == null)
            {
                Destroy(gameObject);
                return;
            }

            var end = target.position;
            var distance = Mathf.Max(.1f, Vector3.Distance(start, end));
            progress += speed * Time.deltaTime / distance;

            var t = Mathf.Clamp01(progress);
            var position = Vector3.Lerp(start, end, t);
            position.y += 4f * arcHeight * t * (1f - t);
            transform.position = position;

            if (progress < 1f)
                return;

            var unit = target.GetComponentInParent<PenguinUnit>();
            if (unit != null && unit.IsPlayer != fromPlayer)
                unit.TakeDamage(damage);

            Destroy(gameObject);
        }
    }
}
