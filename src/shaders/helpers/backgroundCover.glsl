// Rewritten version of this snippet ->
// https://gist.github.com/statico/df64c5d167362ecf7b34fca0b1459a44
vec2 backgroundCover(vec2 coords, vec2 resIn, vec2 resOut) {
    vec2 new = vec2(resIn.x * resOut.y / resIn.y, resOut.y);
    vec2 offset = vec2((new.x - resOut.x) / 2.0, 0.0);
    
    float outputAspect = resOut.x / resOut.y;
    float inputAspect = resIn.x / resIn.y;
    if (outputAspect >= inputAspect) {
        new = vec2(resOut.x, resIn.y * resOut.x / resIn.x);
        offset = vec2(0.0, (new.y - resOut.y) / 2.0);
    }
    
    offset = offset / new;

    return coords * resOut / new + offset;
}

#pragma glslify: export(backgroundCover)