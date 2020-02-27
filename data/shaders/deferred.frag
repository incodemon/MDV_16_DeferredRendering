#version 330

//light structs and uniforms
struct Light {
    vec4 position;
    vec4 direction;
    vec4 color;
    float linear_att;
    float quadratic_att;
    float spot_inner_cosine;
    float spot_outer_cosine;
    mat4 view_projection;
    int type; // 0 - directional; 1 - point; 2 - spot
    int cast_shadow;
};

in vec2 v_uv;
out vec4 fragColor;

const int MAX_LIGHTS = 8;
uniform int u_num_lights;

layout (std140) uniform u_lights_ubo
{
    Light lights[MAX_LIGHTS]; 
};

uniform vec3 u_cam_pos;
uniform sampler2D u_tex_position;
uniform sampler2D u_tex_normal;
uniform sampler2D u_tex_albedo;

void main(){

	vec3 position = texture(u_tex_position, v_uv).xyz;
	vec3 N  = texture(u_tex_normal, v_uv).xyz;
	vec4 albedo_spec = texture(u_tex_albedo,v_uv);
	vec3 V = normalize(u_cam_pos - position);

	vec3 final_color = vec3(0);
	for(int i = 0; i<u_num_lights; i++){
		vec3 L = -normalize(lights[i].direction.xyz);
		vec3 R = reflect(-L,N);

		float NdotL = max(0.0, dot(N,L));
		vec3 diffuse_color = NdotL * albedo_spec.xyz * lights[i].color.xyz;

		float RdotV = max(0.0,dot(R,V));
		RdotV = pow(RdotV,30);
		vec3 specular_color = RdotV * albedo_spec.w * lights[i].color.xyz;

		final_color += diffuse_color + specular_color;
	}

	fragColor = vec4(final_color,1.0);
}