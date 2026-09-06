window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-capmap-viz",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  CAPMAP_RPC_CHANNEL: () => CAPMAP_RPC_CHANNEL,
  apply: () => apply,
  default: () => index_default,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/client/CapMapOverlay.tsx
var import_react2 = require("react");

// src/client/graph/GraphCanvas.tsx
var import_react = require("react");

// node_modules/d3-force/src/center.js
function center_default(x3, y3) {
  var nodes, strength = 1;
  if (x3 == null) x3 = 0;
  if (y3 == null) y3 = 0;
  function force() {
    var i, n = nodes.length, node, sx = 0, sy = 0;
    for (i = 0; i < n; ++i) {
      node = nodes[i], sx += node.x, sy += node.y;
    }
    for (sx = (sx / n - x3) * strength, sy = (sy / n - y3) * strength, i = 0; i < n; ++i) {
      node = nodes[i], node.x -= sx, node.y -= sy;
    }
  }
  force.initialize = function(_) {
    nodes = _;
  };
  force.x = function(_) {
    return arguments.length ? (x3 = +_, force) : x3;
  };
  force.y = function(_) {
    return arguments.length ? (y3 = +_, force) : y3;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  return force;
}

// node_modules/d3-quadtree/src/add.js
function add_default(d) {
  const x3 = +this._x.call(null, d), y3 = +this._y.call(null, d);
  return add(this.cover(x3, y3), x3, y3, d);
}
function add(tree, x3, y3, d) {
  if (isNaN(x3) || isNaN(y3)) return tree;
  var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i, j;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x3 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y3 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x3 === xp && y3 === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
    if (right = x3 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y3 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}
function addAll(data) {
  var d, i, n = data.length, x3, y3, xz = new Array(n), yz = new Array(n), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (i = 0; i < n; ++i) {
    if (isNaN(x3 = +this._x.call(null, d = data[i])) || isNaN(y3 = +this._y.call(null, d))) continue;
    xz[i] = x3;
    yz[i] = y3;
    if (x3 < x0) x0 = x3;
    if (x3 > x1) x1 = x3;
    if (y3 < y0) y0 = y3;
    if (y3 > y1) y1 = y3;
  }
  if (x0 > x1 || y0 > y1) return this;
  this.cover(x0, y0).cover(x1, y1);
  for (i = 0; i < n; ++i) {
    add(this, xz[i], yz[i], data[i]);
  }
  return this;
}

// node_modules/d3-quadtree/src/cover.js
function cover_default(x3, y3) {
  if (isNaN(x3 = +x3) || isNaN(y3 = +y3)) return this;
  var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x3)) + 1;
    y1 = (y0 = Math.floor(y3)) + 1;
  } else {
    var z = x1 - x0 || 1, node = this._root, parent, i;
    while (x0 > x3 || x3 >= x1 || y0 > y3 || y3 >= y1) {
      i = (y3 < y0) << 1 | x3 < x0;
      parent = new Array(4), parent[i] = node, node = parent, z *= 2;
      switch (i) {
        case 0:
          x1 = x0 + z, y1 = y0 + z;
          break;
        case 1:
          x0 = x1 - z, y1 = y0 + z;
          break;
        case 2:
          x1 = x0 + z, y0 = y1 - z;
          break;
        case 3:
          x0 = x1 - z, y0 = y1 - z;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
}

// node_modules/d3-quadtree/src/data.js
function data_default() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}

// node_modules/d3-quadtree/src/extent.js
function extent_default(_) {
  return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}

// node_modules/d3-quadtree/src/quad.js
function quad_default(node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
}

// node_modules/d3-quadtree/src/find.js
function find_default(x3, y3, radius) {
  var data, x0 = this._x0, y0 = this._y0, x1, y1, x22, y22, x32 = this._x1, y32 = this._y1, quads = [], node = this._root, q, i;
  if (node) quads.push(new quad_default(node, x0, y0, x32, y32));
  if (radius == null) radius = Infinity;
  else {
    x0 = x3 - radius, y0 = y3 - radius;
    x32 = x3 + radius, y32 = y3 + radius;
    radius *= radius;
  }
  while (q = quads.pop()) {
    if (!(node = q.node) || (x1 = q.x0) > x32 || (y1 = q.y0) > y32 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2;
      quads.push(
        new quad_default(node[3], xm, ym, x22, y22),
        new quad_default(node[2], x1, ym, xm, y22),
        new quad_default(node[1], xm, y1, x22, ym),
        new quad_default(node[0], x1, y1, xm, ym)
      );
      if (i = (y3 >= ym) << 1 | x3 >= xm) {
        q = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i];
        quads[quads.length - 1 - i] = q;
      }
    } else {
      var dx = x3 - +this._x.call(null, node.data), dy = y3 - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
      if (d2 < radius) {
        var d = Math.sqrt(radius = d2);
        x0 = x3 - d, y0 = y3 - d;
        x32 = x3 + d, y32 = y3 + d;
        data = node.data;
      }
    }
  }
  return data;
}

// node_modules/d3-quadtree/src/remove.js
function remove_default(d) {
  if (isNaN(x3 = +this._x.call(null, d)) || isNaN(y3 = +this._y.call(null, d))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x3, y3, xm, ym, right, bottom, i, j;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x3 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y3 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
  }
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i] = next : delete parent[i];
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;
    else this._root = node;
  }
  return this;
}
function removeAll(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}

// node_modules/d3-quadtree/src/root.js
function root_default() {
  return this._root;
}

// node_modules/d3-quadtree/src/size.js
function size_default() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}

// node_modules/d3-quadtree/src/visit.js
function visit_default(callback) {
  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
  if (node) quads.push(new quad_default(node, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
    }
  }
  return this;
}

// node_modules/d3-quadtree/src/visitAfter.js
function visitAfter_default(callback) {
  var quads = [], next = [], q;
  if (this._root) quads.push(new quad_default(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    var node = q.node;
    if (node.length) {
      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.x1, q.y1);
  }
  return this;
}

// node_modules/d3-quadtree/src/x.js
function defaultX(d) {
  return d[0];
}
function x_default(_) {
  return arguments.length ? (this._x = _, this) : this._x;
}

// node_modules/d3-quadtree/src/y.js
function defaultY(d) {
  return d[1];
}
function y_default(_) {
  return arguments.length ? (this._y = _, this) : this._y;
}

// node_modules/d3-quadtree/src/quadtree.js
function quadtree(nodes, x3, y3) {
  var tree = new Quadtree(x3 == null ? defaultX : x3, y3 == null ? defaultY : y3, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Quadtree(x3, y3, x0, y0, x1, y1) {
  this._x = x3;
  this._y = y3;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = void 0;
}
function leaf_copy(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto = quadtree.prototype = Quadtree.prototype;
treeProto.copy = function() {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 4; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });
        else node.target[i] = leaf_copy(child);
      }
    }
  }
  return copy;
};
treeProto.add = add_default;
treeProto.addAll = addAll;
treeProto.cover = cover_default;
treeProto.data = data_default;
treeProto.extent = extent_default;
treeProto.find = find_default;
treeProto.remove = remove_default;
treeProto.removeAll = removeAll;
treeProto.root = root_default;
treeProto.size = size_default;
treeProto.visit = visit_default;
treeProto.visitAfter = visitAfter_default;
treeProto.x = x_default;
treeProto.y = y_default;

// node_modules/d3-force/src/constant.js
function constant_default(x3) {
  return function() {
    return x3;
  };
}

// node_modules/d3-force/src/jiggle.js
function jiggle_default(random) {
  return (random() - 0.5) * 1e-6;
}

// node_modules/d3-force/src/collide.js
function x(d) {
  return d.x + d.vx;
}
function y(d) {
  return d.y + d.vy;
}
function collide_default(radius) {
  var nodes, radii, random, strength = 1, iterations = 1;
  if (typeof radius !== "function") radius = constant_default(radius == null ? 1 : +radius);
  function force() {
    var i, n = nodes.length, tree, node, xi, yi, ri, ri2;
    for (var k = 0; k < iterations; ++k) {
      tree = quadtree(nodes, x, y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index], ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply2);
      }
    }
    function apply2(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if (data.index > node.index) {
          var x3 = xi - data.x - data.vx, y3 = yi - data.y - data.vy, l = x3 * x3 + y3 * y3;
          if (l < r * r) {
            if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
            if (y3 === 0) y3 = jiggle_default(random), l += y3 * y3;
            l = (r - (l = Math.sqrt(l))) / l * strength;
            node.vx += (x3 *= l) * (r = (rj *= rj) / (ri2 + rj));
            node.vy += (y3 *= l) * r;
            data.vx -= x3 * (r = 1 - r);
            data.vy -= y3 * r;
          }
        }
        return;
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }
  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : radius;
  };
  return force;
}

// node_modules/d3-force/src/link.js
function index(d) {
  return d.index;
}
function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}
function link_default(links) {
  var id = index, strength = defaultStrength, strengths, distance = constant_default(30), distances, nodes, count, bias, random, iterations = 1;
  if (links == null) links = [];
  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }
  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x3, y3, l, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x3 = target.x + target.vx - source.x - source.vx || jiggle_default(random);
        y3 = target.y + target.vy - source.y - source.vy || jiggle_default(random);
        l = Math.sqrt(x3 * x3 + y3 * y3);
        l = (l - distances[i]) / l * alpha * strengths[i];
        x3 *= l, y3 *= l;
        target.vx -= x3 * (b = bias[i]);
        target.vy -= y3 * b;
        source.vx += x3 * (b = 1 - b);
        source.vy += y3 * b;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, m2 = links.length, nodeById = new Map(nodes.map((d, i2) => [id(d, i2, nodes), d])), link;
    for (i = 0, count = new Array(n); i < m2; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }
    for (i = 0, bias = new Array(m2); i < m2; ++i) {
      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }
    strengths = new Array(m2), initializeStrength();
    distances = new Array(m2), initializeDistance();
  }
  function initializeStrength() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }
  function initializeDistance() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links);
    }
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };
  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initializeStrength(), force) : strength;
  };
  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant_default(+_), initializeDistance(), force) : distance;
  };
  return force;
}

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name2 = "", i = t.indexOf(".");
    if (i >= 0) name2 = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name: name2 };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get(type, name2) {
  for (var i = 0, n = type.length, c2; i < n; ++i) {
    if ((c2 = type[i]).name === name2) {
      return c2.value;
    }
  }
}
function set(type, name2, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name2) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name: name2, value: callback });
  return type;
}
var dispatch_default = dispatch;

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-force/src/lcg.js
var a = 1664525;
var c = 1013904223;
var m = 4294967296;
function lcg_default() {
  let s = 1;
  return () => (s = (a * s + c) % m) / m;
}

// node_modules/d3-force/src/simulation.js
function x2(d) {
  return d.x;
}
function y2(d) {
  return d.y;
}
var initialRadius = 10;
var initialAngle = Math.PI * (3 - Math.sqrt(5));
function simulation_default(nodes) {
  var simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch_default("tick", "end"), random = lcg_default();
  if (nodes == null) nodes = [];
  function step() {
    tick();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }
  function tick(iterations) {
    var i, n = nodes.length, node;
    if (iterations === void 0) iterations = 1;
    for (var k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay;
      forces.forEach(function(force) {
        force(alpha);
      });
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }
    return simulation;
  }
  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (isNaN(node.x) || isNaN(node.y)) {
        var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }
  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes, random);
    return force;
  }
  initializeNodes();
  return simulation = {
    tick,
    restart: function() {
      return stepper.restart(step), simulation;
    },
    stop: function() {
      return stepper.stop(), simulation;
    },
    nodes: function(_) {
      return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },
    alpha: function(_) {
      return arguments.length ? (alpha = +_, simulation) : alpha;
    },
    alphaMin: function(_) {
      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
    },
    alphaDecay: function(_) {
      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
    },
    alphaTarget: function(_) {
      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
    },
    velocityDecay: function(_) {
      return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
    },
    randomSource: function(_) {
      return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
    },
    force: function(name2, _) {
      return arguments.length > 1 ? (_ == null ? forces.delete(name2) : forces.set(name2, initializeForce(_)), simulation) : forces.get(name2);
    },
    find: function(x3, y3, radius) {
      var i = 0, n = nodes.length, dx, dy, d2, node, closest;
      if (radius == null) radius = Infinity;
      else radius *= radius;
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dx = x3 - node.x;
        dy = y3 - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;
      }
      return closest;
    },
    on: function(name2, _) {
      return arguments.length > 1 ? (event.on(name2, _), simulation) : event.on(name2);
    }
  };
}

// node_modules/d3-force/src/manyBody.js
function manyBody_default() {
  var nodes, node, random, alpha, strength = constant_default(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
  function force(_) {
    var i, n = nodes.length, tree = quadtree(nodes, x2, y2).visitAfter(accumulate);
    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply2);
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node2;
    strengths = new Array(n);
    for (i = 0; i < n; ++i) node2 = nodes[i], strengths[node2.index] = +strength(node2, i, nodes);
  }
  function accumulate(quad) {
    var strength2 = 0, q, c2, weight = 0, x3, y3, i;
    if (quad.length) {
      for (x3 = y3 = i = 0; i < 4; ++i) {
        if ((q = quad[i]) && (c2 = Math.abs(q.value))) {
          strength2 += q.value, weight += c2, x3 += c2 * q.x, y3 += c2 * q.y;
        }
      }
      quad.x = x3 / weight;
      quad.y = y3 / weight;
    } else {
      q = quad;
      q.x = q.data.x;
      q.y = q.data.y;
      do
        strength2 += strengths[q.data.index];
      while (q = q.next);
    }
    quad.value = strength2;
  }
  function apply2(quad, x1, _, x22) {
    if (!quad.value) return true;
    var x3 = quad.x - node.x, y3 = quad.y - node.y, w = x22 - x1, l = x3 * x3 + y3 * y3;
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
        if (y3 === 0) y3 = jiggle_default(random), l += y3 * y3;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        node.vx += x3 * quad.value * alpha / l;
        node.vy += y3 * quad.value * alpha / l;
      }
      return true;
    } else if (quad.length || l >= distanceMax2) return;
    if (quad.data !== node || quad.next) {
      if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
      if (y3 === 0) y3 = jiggle_default(random), l += y3 * y3;
      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
    }
    do
      if (quad.data !== node) {
        w = strengths[quad.data.index] * alpha / l;
        node.vx += x3 * w;
        node.vy += y3 * w;
      }
    while (quad = quad.next);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
  };
  force.distanceMin = function(_) {
    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
  };
  force.distanceMax = function(_) {
    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
  };
  force.theta = function(_) {
    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
  };
  return force;
}

// src/client/graph/colors.ts
var TYPE_FILL = {
  map: "#3b82f6",
  scheme: "#22c55e",
  test: "#eab308",
  norm: "#a855f7",
  index: "#9ca3af",
  archive: "#6b7280"
};
var STATUS_STROKE = {
  \u65B9\u6848\u4E2D: "#9ca3af",
  \u5DF2\u786E\u8BA4: "#94a3b8",
  \u89C4\u683C\u4E2D: "#818cf8",
  \u5DF2\u62C6\u5206: "#a78bfa",
  \u5F00\u53D1\u4E2D: "#3b82f6",
  \u5DF2\u5F00\u53D1: "#0ea5e9",
  \u9A8C\u8BC1\u4E2D: "#f59e0b",
  \u5DF2\u9A8C\u8BC1: "#22c55e",
  \u843D\u5730\u4E2D: "#14b8a6",
  \u5DF2\u843D\u5730: "#10b981",
  \u5DF2\u5F52\u6863: "#6b7280",
  \u6D4B\u8BD5\u4E2D: "#f59e0b"
};
var DEFAULT_FILL = "#9ca3af";
var DEFAULT_STROKE = "#111827";
function typeFill(type) {
  return TYPE_FILL[type] ?? DEFAULT_FILL;
}
function statusStroke(status) {
  if (!status) return DEFAULT_STROKE;
  return STATUS_STROKE[status] ?? DEFAULT_STROKE;
}
function statusDashed(status) {
  return status === "\u5DF2\u5F52\u6863";
}

// src/client/graph/model.ts
var NODE_RADIUS = 10;
var NODE_RADIUS_SELECTED = 13;
function oneHop(id, edges, kinds) {
  const out = /* @__PURE__ */ new Set([id]);
  for (const e of edges) {
    if (kinds && !kinds.has(e.kind)) continue;
    if (e.source === id) out.add(e.target);
    else if (e.target === id) out.add(e.source);
  }
  return out;
}
function degree(id, edges, kinds) {
  let n = 0;
  for (const e of edges) {
    if (kinds && !kinds.has(e.kind)) continue;
    if (e.source === e.target) continue;
    if (e.source === id || e.target === id) n += 1;
  }
  return n;
}
function worldToScreen(cam, x3, y3) {
  return { x: x3 * cam.k + cam.x, y: y3 * cam.k + cam.y };
}
function screenToWorld(cam, x3, y3) {
  return { x: (x3 - cam.x) / cam.k, y: (y3 - cam.y) / cam.k };
}
function hitNode(nodes, positions, worldX, worldY, radius) {
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const id = nodes[i].id;
    const p = positions[id];
    if (!p) continue;
    const dx = p.x - worldX;
    const dy = p.y - worldY;
    if (dx * dx + dy * dy <= radius * radius) return id;
  }
  return null;
}
function fitTransform(points, viewW, viewH, padding = 48) {
  if (points.length === 0 || viewW <= 0 || viewH <= 0) {
    return { x: 0, y: 0, k: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const bw = Math.max(maxX - minX, 40);
  const bh = Math.max(maxY - minY, 40);
  const innerW = Math.max(viewW - padding * 2, 1);
  const innerH = Math.max(viewH - padding * 2, 1);
  const k = Math.min(innerW / bw, innerH / bh, 8);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { k, x: viewW / 2 - cx * k, y: viewH / 2 - cy * k };
}
function clampZoom(k) {
  return Math.min(8, Math.max(0.2, k));
}
function zoomAt(cam, screenX, screenY, nextK) {
  const k = clampZoom(nextK);
  const w = screenToWorld(cam, screenX, screenY);
  return { k, x: screenX - w.x * k, y: screenY - w.y * k };
}

// src/client/graph/GraphCanvas.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var HOVER_MS = 200;
var DRAG_THRESHOLD = 5;
var VISIBLE_KINDS = /* @__PURE__ */ new Set(["wikilink"]);
function GraphCanvas({ graph, selected, onSelect }) {
  const wrapRef = (0, import_react.useRef)(null);
  const canvasRef = (0, import_react.useRef)(null);
  const simRef = (0, import_react.useRef)(null);
  const nodesRef = (0, import_react.useRef)([]);
  const camRef = (0, import_react.useRef)({ x: 0, y: 0, k: 1 });
  const selectedRef = (0, import_react.useRef)(selected);
  const hoverIdRef = (0, import_react.useRef)(null);
  const hoverTimerRef = (0, import_react.useRef)(null);
  const fittedRef = (0, import_react.useRef)(false);
  const pointerRef = (0, import_react.useRef)({ mode: "none", startX: 0, startY: 0, lastX: 0, lastY: 0, nodeId: null });
  const [hover, setHover] = (0, import_react.useState)(null);
  const [size, setSize] = (0, import_react.useState)({ w: 0, h: 0 });
  selectedRef.current = selected;
  const positionsOf = () => {
    const out = {};
    for (const n of nodesRef.current) {
      out[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
    }
    return out;
  };
  const draw = (0, import_react.useCallback)(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cam = camRef.current;
    const sel = selectedRef.current;
    const edges = graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind));
    const hop = sel ? oneHop(sel, edges, VISIBLE_KINDS) : null;
    const pos = positionsOf();
    ctx.save();
    ctx.lineCap = "round";
    for (const e of graph.edges) {
      if (!VISIBLE_KINDS.has(e.kind)) continue;
      const a2 = pos[e.source];
      const b = pos[e.target];
      if (!a2 || !b) continue;
      const sa = worldToScreen(cam, a2.x, a2.y);
      const sb = worldToScreen(cam, b.x, b.y);
      const active = !hop || hop.has(e.source) && hop.has(e.target);
      ctx.strokeStyle = active ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.06)";
      ctx.lineWidth = active ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }
    for (const n of nodesRef.current) {
      const p = pos[n.id];
      if (!p) continue;
      const s = worldToScreen(cam, p.x, p.y);
      const isSel = n.id === sel;
      const active = !hop || hop.has(n.id);
      const r = (isSel ? NODE_RADIUS_SELECTED : NODE_RADIUS) * Math.min(cam.k, 1.4);
      ctx.globalAlpha = active ? 1 : 0.18;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = typeFill(n.type);
      ctx.fill();
      ctx.lineWidth = isSel ? 3 : 2;
      ctx.strokeStyle = statusStroke(n.status);
      ctx.setLineDash(statusDashed(n.status) ? [4, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);
      if (cam.k >= 0.45) {
        ctx.fillStyle = "#e5e7eb";
        ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const label = n.title.length > 16 ? `${n.title.slice(0, 16)}\u2026` : n.title;
        ctx.fillText(label, s.x, s.y - r - 4);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }, [graph]);
  const fit = (0, import_react.useCallback)(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    fittedRef.current = true;
    const pts = nodesRef.current.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
    camRef.current = fitTransform(pts, wrap.clientWidth, wrap.clientHeight);
    draw();
  }, [draw]);
  (0, import_react.useEffect)(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: wrap.clientWidth, h: wrap.clientHeight });
      draw();
    });
    ro.observe(wrap);
    setSize({ w: wrap.clientWidth, h: wrap.clientHeight });
    return () => ro.disconnect();
  }, [draw]);
  (0, import_react.useEffect)(() => {
    fittedRef.current = false;
    const nodes = graph.nodes.map((n) => ({
      id: n.id,
      title: n.title,
      type: n.type,
      status: n.status,
      summary: n.summary
    }));
    const byId = new Set(nodes.map((n) => n.id));
    const links = graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind) && byId.has(e.source) && byId.has(e.target)).map((e) => ({ source: e.source, target: e.target, kind: e.kind }));
    nodesRef.current = nodes;
    const wrap = wrapRef.current;
    const W = wrap?.clientWidth || 800;
    const H = wrap?.clientHeight || 560;
    const sim = simulation_default(nodes).force("link", link_default(links).id((d) => d.id).distance(80).strength(0.55)).force("charge", manyBody_default().strength(-220)).force("center", center_default(W / 2, H / 2)).force("collide", collide_default().radius(22)).on("tick", () => {
      if (!fittedRef.current && sim.alpha() < 0.08) {
        fittedRef.current = true;
        const pts = nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
        const el = wrapRef.current;
        if (el) camRef.current = fitTransform(pts, el.clientWidth, el.clientHeight);
      }
      draw();
    });
    simRef.current = sim;
    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [graph, draw]);
  (0, import_react.useEffect)(() => {
    draw();
  }, [selected, draw, size]);
  const localXY = (ev) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };
  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };
  const scheduleHover = (id, sx, sy) => {
    if (id === hoverIdRef.current) {
      if (id) setHover({ id, x: sx, y: sy });
      return;
    }
    hoverIdRef.current = id;
    clearHoverTimer();
    setHover(null);
    if (!id) return;
    hoverTimerRef.current = setTimeout(() => {
      setHover({ id, x: sx, y: sy });
    }, HOVER_MS);
  };
  const onPointerDown = (ev) => {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    const { x: x3, y: y3 } = localXY(ev);
    const world = screenToWorld(camRef.current, x3, y3);
    const id = hitNode(nodesRef.current, positionsOf(), world.x, world.y, NODE_RADIUS_SELECTED + 4);
    pointerRef.current = {
      mode: "pending",
      startX: x3,
      startY: y3,
      lastX: x3,
      lastY: y3,
      nodeId: id
    };
  };
  const onPointerMove = (ev) => {
    const { x: x3, y: y3 } = localXY(ev);
    const ptr = pointerRef.current;
    if (ptr.mode === "none") {
      const world = screenToWorld(camRef.current, x3, y3);
      const id = hitNode(nodesRef.current, positionsOf(), world.x, world.y, NODE_RADIUS + 3);
      scheduleHover(id, x3, y3);
      return;
    }
    const dx = x3 - ptr.startX;
    const dy = y3 - ptr.startY;
    if (ptr.mode === "pending" && dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
      ptr.mode = ptr.nodeId ? "drag" : "pan";
      if (ptr.mode === "drag" && ptr.nodeId) {
        const n = nodesRef.current.find((node) => node.id === ptr.nodeId);
        if (n) {
          const w = screenToWorld(camRef.current, x3, y3);
          n.fx = w.x;
          n.fy = w.y;
          simRef.current?.alphaTarget(0.25).restart();
        }
      }
    }
    if (ptr.mode === "pan") {
      fittedRef.current = true;
      camRef.current = {
        ...camRef.current,
        x: camRef.current.x + (x3 - ptr.lastX),
        y: camRef.current.y + (y3 - ptr.lastY)
      };
      draw();
    } else if (ptr.mode === "drag" && ptr.nodeId) {
      const n = nodesRef.current.find((node) => node.id === ptr.nodeId);
      if (n) {
        const w = screenToWorld(camRef.current, x3, y3);
        n.fx = w.x;
        n.fy = w.y;
        n.x = w.x;
        n.y = w.y;
        draw();
      }
    }
    ptr.lastX = x3;
    ptr.lastY = y3;
  };
  const onPointerUp = (ev) => {
    const ptr = pointerRef.current;
    if (ptr.mode === "pending" && ptr.nodeId) {
      onSelect(ptr.nodeId);
    } else if (ptr.mode === "pending" && !ptr.nodeId) {
      onSelect(null);
    }
    if (ptr.mode === "drag") {
      simRef.current?.alphaTarget(0);
    }
    pointerRef.current = { mode: "none", startX: 0, startY: 0, lastX: 0, lastY: 0, nodeId: null };
    try {
      ev.currentTarget.releasePointerCapture(ev.pointerId);
    } catch {
    }
  };
  const onWheel = (ev) => {
    ev.preventDefault();
    const { x: x3, y: y3 } = (() => {
      const rect = ev.currentTarget.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    })();
    fittedRef.current = true;
    const factor = ev.deltaY > 0 ? 0.92 : 1.08;
    camRef.current = zoomAt(camRef.current, x3, y3, camRef.current.k * factor);
    draw();
  };
  const hoverNode = hover ? graph.nodes.find((n) => n.id === hover.id) : null;
  const hoverDeg = hover ? degree(hover.id, graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind)), VISIBLE_KINDS) : 0;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: wrapRef, style: { position: "relative", width: "100%", height: "100%", overflow: "hidden" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "canvas",
      {
        ref: canvasRef,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerLeave: () => {
          clearHoverTimer();
          hoverIdRef.current = null;
          setHover(null);
        },
        onWheel,
        style: { display: "block", width: "100%", height: "100%", cursor: "grab", touchAction: "none" }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        onClick: fit,
        style: {
          position: "absolute",
          right: 12,
          top: 12,
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #374151",
          background: "#111827",
          color: "#e5e7eb",
          cursor: "pointer",
          fontSize: 12
        },
        children: "Fit"
      }
    ),
    hoverNode && hover && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          left: Math.min(hover.x + 12, Math.max(8, (wrapRef.current?.clientWidth ?? 400) - 240)),
          top: Math.min(hover.y + 12, Math.max(8, (wrapRef.current?.clientHeight ?? 300) - 120)),
          width: 220,
          padding: "8px 10px",
          borderRadius: 8,
          background: "#111827",
          border: "1px solid #374151",
          color: "#e5e7eb",
          fontSize: 12,
          pointerEvents: "none",
          zIndex: 2
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600, marginBottom: 4 }, children: hoverNode.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: "#9ca3af" }, children: [
            "\u7C7B\u578B ",
            hoverNode.type,
            " \xB7 \u72B6\u6001 ",
            hoverNode.status ?? "\u2014"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: "#9ca3af" }, children: [
            "\u5EA6\u6570 ",
            hoverDeg
          ] }),
          hoverNode.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginTop: 6, color: "#cbd5e1" }, children: hoverNode.summary.length > 80 ? `${hoverNode.summary.slice(0, 80)}\u2026` : hoverNode.summary })
        ]
      }
    )
  ] });
}

// src/client/CapMapOverlay.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function CapMapOverlay({ call }) {
  const [root, setRoot] = (0, import_react2.useState)("");
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  const [graph, setGraph] = (0, import_react2.useState)(null);
  const [open, setOpen] = (0, import_react2.useState)(true);
  const [selected, setSelected] = (0, import_react2.useState)(null);
  const load = (0, import_react2.useCallback)(async () => {
    if (!root.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await call("parse", { root: root.trim() });
      if (res.ok) {
        setGraph(res.value);
        setSelected(null);
      } else {
        setError(res.error?.message ?? "\u89E3\u6790\u5931\u8D25");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [call, root]);
  const selectedNode = (0, import_react2.useMemo)(
    () => graph && selected ? graph.nodes.find((n) => n.id === selected) ?? null : null,
    [graph, selected]
  );
  const byType = (0, import_react2.useMemo)(() => {
    const m2 = {};
    for (const n of graph?.nodes ?? []) m2[n.type] = (m2[n.type] ?? 0) + 1;
    return m2;
  }, [graph]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { position: "fixed", inset: 0, zIndex: 1e3, pointerEvents: "none" }, children: !open ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "button",
    {
      type: "button",
      onClick: () => setOpen(true),
      style: {
        position: "absolute",
        right: 16,
        bottom: 16,
        pointerEvents: "auto",
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #374151",
        background: "#111827",
        color: "#e5e7eb",
        cursor: "pointer",
        fontSize: 13
      },
      children: "CapMap Viz"
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      style: {
        position: "absolute",
        inset: 0,
        background: "rgba(10,12,18,0.86)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 8, padding: "12px 16px", alignItems: "center" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontWeight: 600, color: "#e5e7eb" }, children: "CapMap Viz" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              value: root,
              onChange: (e) => setRoot(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && load(),
              placeholder: "\u9879\u76EE\u6839\u76EE\u5F55\uFF08\u542B capmap.yaml \u6216 docs/\uFF09",
              style: {
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#111827",
                color: "#e5e7eb"
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              onClick: load,
              disabled: loading || !root.trim(),
              style: {
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                cursor: "pointer"
              },
              children: loading ? "\u52A0\u8F7D\u4E2D\u2026" : "\u52A0\u8F7D"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setOpen(false),
              style: {
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "transparent",
                color: "#e5e7eb",
                cursor: "pointer"
              },
              children: "\u5173\u95ED"
            }
          )
        ] }),
        error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { padding: "8px 16px", color: "#fca5a5", fontSize: 13 }, children: error }),
        selectedNode && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { padding: "0 16px 8px", fontSize: 12, color: "#9ca3af" }, children: [
          "\u805A\u7126\uFF1A",
          selectedNode.title,
          " \xB7 ",
          selectedNode.type,
          " \xB7 ",
          selectedNode.status ?? "\u65E0\u72B6\u6001 Tag",
          graph ? ` \xB7 \u8282\u70B9 ${graph.nodes.length} / \u8FB9 ${graph.edges.length}` : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { flex: 1, minHeight: 0, position: "relative" }, children: graph ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(GraphCanvas, { graph, selected, onSelect: setSelected }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { padding: 40, color: "#6b7280", fontSize: 14 }, children: "\u8F93\u5165\u9879\u76EE\u6839\u5E76\u300C\u52A0\u8F7D\u300D\uFF0C\u6E32\u67D3\u8BE5\u9879\u76EE\u7684 capmap \u6587\u6863\u4F53\u7CFB\u56FE\u8C31\uFF08\u7C7B\u578B\u586B\u8272 + \u72B6\u6001\u63CF\u8FB9\uFF09\u3002" }) }),
        graph && !selectedNode && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { padding: "8px 16px", fontSize: 11, color: "#6b7280" }, children: [
          "\u8282\u70B9 ",
          graph.nodes.length,
          " \xB7 \u8FB9 ",
          graph.edges.length,
          " \xB7 \u7C7B\u578B",
          " ",
          Object.keys(byType).map((t) => `${t}:${byType[t]}`).join(" "),
          " ",
          "\xB7 \u8BED\u4E49\u8FB9\u9ED8\u8BA4\u9690\u85CF"
        ] })
      ]
    }
  ) });
}

// src/client/index.tsx
var name = "capmap-viz-client";
var inject = ["slots", "connection"];
var CAPMAP_RPC_CHANNEL = "/capmap";
function apply(ctx) {
  ctx.slots.inject(
    "shell.overlay",
    () => ctx.slots.register(
      {
        name: "shell.overlay",
        id: "capmap-viz-overlay",
        label: () => "CapMap Viz",
        inject: () => ({
          call: (endpoint, payload) => ctx.connection.rpc.call(CAPMAP_RPC_CHANNEL, endpoint, payload)
        })
      },
      CapMapOverlay
    )
  );
}
var index_default = { name, inject, apply };
    return module.exports;
  }
});
