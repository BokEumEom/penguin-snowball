using UnityEngine;

namespace PenguinSnowball
{
    [ExecuteAlways]
    public sealed class ResponsiveSafeArea : MonoBehaviour
    {
        [SerializeField] private RectTransform target;
        private Rect lastSafeArea;
        private Vector2Int lastScreen;

        private void OnEnable() => Apply();
        private void Update()
        {
            var size = new Vector2Int(Screen.width, Screen.height);
            if (Screen.safeArea != lastSafeArea || size != lastScreen)
                Apply();
        }

        private void Apply()
        {
            if (target == null)
                target = transform as RectTransform;

            if (target == null || Screen.width <= 0 || Screen.height <= 0)
                return;

            var safe = Screen.safeArea;
            lastSafeArea = safe;
            lastScreen = new Vector2Int(Screen.width, Screen.height);

            target.anchorMin = new Vector2(safe.xMin / Screen.width, safe.yMin / Screen.height);
            target.anchorMax = new Vector2(safe.xMax / Screen.width, safe.yMax / Screen.height);
            target.offsetMin = Vector2.zero;
            target.offsetMax = Vector2.zero;
        }
    }
}
