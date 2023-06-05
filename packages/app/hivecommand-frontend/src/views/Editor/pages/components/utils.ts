
// Move out or template into a creator function.
function createPath() {
    return {
    };
  }

function resolvePath(root, path){
  const parts = ((path[0] !== '/' ? '/' : '') + path).split('/');

    return parts.slice(1, parts.length).reduce(function(pathObject, pathName){
      // For each path name we come across, use the existing or create a subpath
      pathObject[pathName] = pathObject[pathName] || createPath();
      // Then return that subpath for the next operation
      return pathObject[pathName];
    // Use the passed in base object to attach our resolutions
    }, root);
  }

export interface ResolvedTree {
  [key: string]: ResolvedTree
}

export const resolveTree = (paths: string[]) : ResolvedTree => {
  var goal = paths.reduce(function(carry, pathEntry){
    // On every path entry, resolve using the base object
    resolvePath(carry, pathEntry);
    // Return the base object for suceeding paths, or for our final value
    return carry;
  // Create our base object
  }, createPath());

  return goal;  
}