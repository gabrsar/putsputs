(() => {
 const vertex = `#version 300 es
 void main() {
   vec2 corner=vec2(float((gl_VertexID << 1) & 2),float(gl_VertexID & 2));
   gl_Position=vec4(corner*2.-1.,0.,1.);
 }`;
 const fragment = `#version 300 es
 precision highp float;
 uniform sampler2D scene;
 out vec4 outputColor;
 float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
 vec3 highlight(vec3 c){return c*smoothstep(.32,.82,max(c.r,max(c.g,c.b)));}
 void main() {
   vec2 pixel=1./vec2(textureSize(scene,0));
   vec2 uv=gl_FragCoord.xy*pixel;
   vec3 center=texture(scene,uv).rgb;
   vec3 left=texture(scene,uv-vec2(pixel.x,0.)).rgb;
   vec3 right=texture(scene,uv+vec2(pixel.x,0.)).rgb;
   vec3 up=texture(scene,uv+vec2(0.,pixel.y)).rgb;
   vec3 down=texture(scene,uv-vec2(0.,pixel.y)).rgb;
   float horizontal=abs(luma(left)-luma(right));
   float vertical=abs(luma(up)-luma(down));
   vec3 across=horizontal>vertical?(left+right)*.5:(up+down)*.5;
   vec3 base=mix(center,across,.26*smoothstep(.035,.35,max(horizontal,vertical)));
   vec3 nearGlow=(highlight(left)+highlight(right)+highlight(up)+highlight(down))*.14;
   vec3 farGlow=vec3(0.);
   for(int j=0;j<8;j++){
     float angle=float(j)*.78539816;
     vec2 offset=vec2(cos(angle),sin(angle))*pixel*5.;
     farGlow+=highlight(texture(scene,uv+offset).rgb);
   }
   vec3 glow=nearGlow+farGlow*.07;
   vec3 graded=pow(max(base,0.),vec3(.94));
   outputColor=vec4(1.-(1.-graded)*exp(-glow*.55),1.);
 }`;

 function createFinish(gl) {
  const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
   const shader=gl.createShader(type);
   gl.shaderSource(shader,source);
   gl.compileShader(shader);
   gl.attachShader(program,shader);
   gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
   gl.deleteProgram(program);
   return null;
  }
  const texture=gl.createTexture(), framebuffer=gl.createFramebuffer();
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  return {program,texture,framebuffer,width:0,height:0};
 }

 window.drawFinishedShader=(surface,width,height)=>{
  const {gl}=surface;
  if(surface.finish===undefined)surface.finish=createFinish(gl);
  const finish=surface.finish;
  if(!finish){gl.drawArrays(gl.TRIANGLES,0,3);return;}
  const {program,texture,framebuffer}=finish;
  gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
  if(width!==finish.width||height!==finish.height){
   gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.deleteFramebuffer(framebuffer);gl.deleteTexture(texture);gl.deleteProgram(program);
    surface.finish=null;
    gl.drawArrays(gl.TRIANGLES,0,3);
    return;
   }
   finish.width=width;finish.height=height;
  }
  gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  gl.useProgram(program);
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.drawArrays(gl.TRIANGLES,0,3);
 };
})();
