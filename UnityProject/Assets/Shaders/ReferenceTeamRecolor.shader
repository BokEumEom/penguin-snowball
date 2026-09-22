Shader "PenguinSnowball/ReferenceTeamRecolor"
{
    Properties
    {
        [PerRendererData] _MainTex ("Sprite Texture", 2D) = "white" {}
        _Color ("Tint", Color) = (1,1,1,1)
        _SourceColor ("Source Team Color", Color) = (0.031,0.694,0.812,1)
        _TeamColor ("Team Color", Color) = (0.957,0.204,0.224,1)
        _Tolerance ("Tolerance", Range(0.01,0.5)) = 0.22
    }

    SubShader
    {
        Tags
        {
            "Queue"="Transparent"
            "IgnoreProjector"="True"
            "RenderType"="Transparent"
            "PreviewType"="Plane"
            "CanUseSpriteAtlas"="True"
        }

        Cull Off
        Lighting Off
        ZWrite Off
        Blend One OneMinusSrcAlpha

        Pass
        {
            CGPROGRAM
            #pragma vertex SpriteVert
            #pragma fragment frag
            #include "UnitySprites.cginc"

            fixed4 _SourceColor;
            fixed4 _TeamColor;
            float _Tolerance;

            fixed4 frag(v2f IN) : SV_Target
            {
                fixed4 c = SampleSpriteTexture(IN.texcoord) * IN.color;
                float distanceToTeam = distance(c.rgb, _SourceColor.rgb);
                float replace = 1.0 - smoothstep(_Tolerance * 0.55, _Tolerance, distanceToTeam);
                c.rgb = lerp(c.rgb, _TeamColor.rgb, replace);
                c.rgb *= c.a;
                return c;
            }
            ENDCG
        }
    }
}
