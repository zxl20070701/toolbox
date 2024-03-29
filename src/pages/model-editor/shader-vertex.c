attribute vec4 a_position;
uniform mat4 u_camera;
uniform mat4 u_matrix;

void main()
{
    vec4 temp = u_camera * u_matrix * a_position;

    // 表示眼睛距离vec4(0.0,0.0,1.0)的距离
    float dist = 2.0;

    // 使用投影直接计算
    // 为保证纹理和相对位置正确
    // x、y、z的改变满足线性变换
    gl_Position = vec4((dist + 1.0) * temp.x, (dist + 1.0) * temp.y, dist * (dist + temp.z) + 1.0 - dist * dist, temp.w * 2.0 * (dist + temp.z));
}