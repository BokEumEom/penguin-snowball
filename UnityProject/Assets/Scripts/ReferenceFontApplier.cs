using UnityEngine;
using UnityEngine.UI;

namespace PenguinSnowball
{
    public sealed class ReferenceFontApplier : MonoBehaviour
    {
        [SerializeField] private string[] preferredFonts =
        {
            "Malgun Gothic",
            "Apple SD Gothic Neo",
            "Noto Sans CJK KR",
            "NanumGothic"
        };

        private void Awake()
        {
            Font font = null;
            foreach (var candidate in preferredFonts)
            {
                font = Font.CreateDynamicFontFromOSFont(candidate, 64);
                if (font != null)
                    break;
            }

            if (font == null)
                return;

            foreach (var text in GetComponentsInChildren<Text>(true))
                text.font = font;
        }
    }
}
