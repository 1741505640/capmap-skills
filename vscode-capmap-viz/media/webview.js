"use strict";
(() => {
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
          tree.visit(apply);
        }
      }
      function apply(quad, x0, y0, x1, y1) {
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
  function find(nodeById2, nodeId) {
    var node = nodeById2.get(nodeId);
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
      var i, n = nodes.length, m2 = links.length, nodeById2 = new Map(nodes.map((d, i2) => [id(d, i2, nodes), d])), link;
      for (i = 0, count = new Array(n); i < m2; ++i) {
        link = links[i], link.index = i;
        if (typeof link.source !== "object") link.source = find(nodeById2, link.source);
        if (typeof link.target !== "object") link.target = find(nodeById2, link.target);
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
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return { type: t, name };
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
  function get(type, name) {
    for (var i = 0, n = type.length, c2; i < n; ++i) {
      if ((c2 = type[i]).name === name) {
        return c2.value;
      }
    }
  }
  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({ name, value: callback });
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
      force: function(name, _) {
        return arguments.length > 1 ? (_ == null ? forces.delete(name) : forces.set(name, initializeForce(_)), simulation) : forces.get(name);
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
      on: function(name, _) {
        return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
      }
    };
  }

  // node_modules/d3-force/src/manyBody.js
  function manyBody_default() {
    var nodes, node, random, alpha, strength = constant_default(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
    function force(_) {
      var i, n = nodes.length, tree = quadtree(nodes, x2, y2).visitAfter(accumulate);
      for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
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
    function apply(quad, x1, _, x22) {
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

  // node_modules/d3-force/src/x.js
  function x_default2(x3) {
    var strength = constant_default(0.1), nodes, strengths, xz;
    if (typeof x3 !== "function") x3 = constant_default(x3 == null ? 0 : +x3);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      xz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(xz[i] = +x3(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_) {
      nodes = _;
      initialize();
    };
    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
    };
    force.x = function(_) {
      return arguments.length ? (x3 = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : x3;
    };
    return force;
  }

  // node_modules/d3-force/src/y.js
  function y_default2(y3) {
    var strength = constant_default(0.1), nodes, strengths, yz;
    if (typeof y3 !== "function") y3 = constant_default(y3 == null ? 0 : +y3);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      yz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(yz[i] = +y3(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_) {
      nodes = _;
      initialize();
    };
    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
    };
    force.y = function(_) {
      return arguments.length ? (y3 = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : y3;
    };
    return force;
  }

  // src/graph/colors.ts
  var TYPE_FILL = {
    map: "#3b82f6",
    scheme: "#22c55e",
    test: "#eab308",
    norm: "#a855f7",
    index: "#9ca3af",
    archive: "#6b7280",
    overview: "#f97316"
  };
  var STATUS_STROKE = {
    \u65B9\u6848\u4E2D: "#e2e8f0",
    \u5DF2\u786E\u8BA4: "#94a3b8",
    \u89C4\u683C\u4E2D: "#818cf8",
    \u5DF2\u62C6\u5206: "#c084fc",
    \u5F00\u53D1\u4E2D: "#f97316",
    \u5DF2\u5F00\u53D1: "#22d3ee",
    \u9A8C\u8BC1\u4E2D: "#eab308",
    \u5DF2\u9A8C\u8BC1: "#4ade80",
    \u843D\u5730\u4E2D: "#2dd4bf",
    \u5DF2\u843D\u5730: "#34d399",
    \u5DF2\u5F52\u6863: "#6b7280",
    \u6D4B\u8BD5\u4E2D: "#fbbf24"
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
    return status === "\u5DF2\u5F52\u6863" ? [4, 3] : null;
  }

  // src/graph/model.ts
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

  // src/webview/graph/mount.ts
  var VISIBLE_KINDS = /* @__PURE__ */ new Set(["wikilink"]);
  var DRAG_THRESHOLD = 5;
  function isArchive(type, path) {
    return type === "archive" || path.startsWith("_archive/") || path.includes("/_archive/");
  }
  function mountGraph(root, opts) {
    root.innerHTML = "";
    root.classList.add("graph-root");
    const hud = document.createElement("div");
    hud.className = "graph-hud";
    hud.innerHTML = '<button type="button" data-act="zoom-in" title="\u653E\u5927">+</button><button type="button" data-act="zoom-out" title="\u7F29\u5C0F">\u2212</button><button type="button" data-act="fit" title="Fit">Fit</button>';
    root.appendChild(hud);
    const wrap = document.createElement("div");
    wrap.className = "graph-wrap";
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    root.appendChild(wrap);
    const tip = document.createElement("div");
    tip.className = "graph-tip";
    tip.hidden = true;
    root.appendChild(tip);
    let graph2 = { nodes: [], edges: [] };
    let nodes = [];
    let sim = null;
    let cam = { x: 0, y: 0, k: 1 };
    let selected = null;
    let fitted = false;
    let disposed = false;
    let pulseT0 = performance.now();
    const pointer = {
      mode: "none",
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      nodeId: null
    };
    const positionsOf = () => {
      const out = {};
      for (const n of nodes) out[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
      return out;
    };
    const draw = () => {
      if (disposed) return;
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w <= 0 || h <= 0) return;
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
      const edges = graph2.edges.filter((e) => VISIBLE_KINDS.has(e.kind));
      const hop = selected ? oneHop(selected, edges, VISIBLE_KINDS) : null;
      const pos = positionsOf();
      for (const e of edges) {
        const a2 = pos[e.source];
        const b = pos[e.target];
        if (!a2 || !b) continue;
        const sa = worldToScreen(cam, a2.x, a2.y);
        const sb = worldToScreen(cam, b.x, b.y);
        const active = !hop || hop.has(e.source) && hop.has(e.target);
        ctx.strokeStyle = active ? "rgba(148,163,184,0.55)" : "rgba(148,163,184,0.12)";
        ctx.lineWidth = active ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.stroke();
      }
      for (const n of nodes) {
        const p = pos[n.id];
        if (!p) continue;
        const s = worldToScreen(cam, p.x, p.y);
        const isSel = n.id === selected;
        const active = !hop || hop.has(n.id);
        const baseR = n.archive ? NODE_RADIUS * 0.75 : NODE_RADIUS;
        let r = (isSel ? NODE_RADIUS_SELECTED : baseR) * Math.min(cam.k, 1.4);
        if (isSel) {
          const pulse = 1 + 0.08 * Math.sin((performance.now() - pulseT0) / 1e3 * Math.PI * 2);
          r *= pulse;
        }
        let alpha = active ? 1 : 0.18;
        if (n.archive && active) alpha *= 0.55;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = typeFill(n.type);
        ctx.fill();
        ctx.lineWidth = isSel ? 3.5 : 2.5;
        ctx.strokeStyle = statusStroke(n.status);
        const dash = statusDashed(n.status) || (n.archive ? [4, 3] : null);
        ctx.setLineDash(dash ?? []);
        ctx.stroke();
        ctx.setLineDash([]);
        if (isSel) {
          ctx.globalAlpha = 0.25 * alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r + 6, 0, Math.PI * 2);
          ctx.strokeStyle = statusStroke(n.status);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        if (cam.k >= 0.55) {
          ctx.fillStyle = n.archive ? "#9ca3af" : "var(--vscode-foreground, #e5e7eb)";
          ctx.fillStyle = "#e5e7eb";
          ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          const label = n.title.length > 16 ? `${n.title.slice(0, 16)}\u2026` : n.title;
          ctx.fillText(label, s.x, s.y - r - 4);
        }
        ctx.globalAlpha = 1;
      }
    };
    const fit = () => {
      fitted = true;
      const pts = nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
      cam = fitTransform(pts, wrap.clientWidth || 800, wrap.clientHeight || 560);
      draw();
    };
    const restartSim = () => {
      sim?.stop();
      nodes = graph2.nodes.map((n) => ({
        id: n.id,
        title: n.title,
        type: n.type,
        status: n.status,
        path: n.path,
        theme: n.theme,
        archive: isArchive(n.type, n.path)
      }));
      const byId = new Set(nodes.map((n) => n.id));
      const links = graph2.edges.filter((e) => VISIBLE_KINDS.has(e.kind) && byId.has(e.source) && byId.has(e.target)).map((e) => ({ source: e.source, target: e.target, kind: e.kind }));
      const W = wrap.clientWidth || 800;
      const H = wrap.clientHeight || 560;
      const themes = [...new Set(nodes.map((n) => n.theme).filter(Boolean))];
      fitted = false;
      sim = simulation_default(nodes).force(
        "link",
        link_default(links).id((d) => d.id).distance(80).strength(0.55)
      ).force("charge", manyBody_default().strength(-220)).force("center", center_default(W / 2, H / 2)).force("collide", collide_default().radius((d) => d.archive ? 16 : 22)).force("cx", x_default2(W / 2).strength(0.045)).force("cy", y_default2(H / 2).strength(0.045));
      if (themes.length > 0) {
        sim.force(
          "x",
          x_default2((d) => {
            const i = Math.max(0, themes.indexOf(d.theme ?? ""));
            return W * (i + 1) / (themes.length + 1);
          }).strength(0.12)
        ).force(
          "y",
          y_default2((d) => d.archive ? H * 0.78 : H * 0.38).strength(0.1)
        );
      } else {
        sim.force(
          "y",
          y_default2((d) => d.archive ? H * 0.72 : H * 0.5).strength(0.04)
        );
      }
      sim.alphaTarget(0.02);
      sim.on("tick", () => {
        if (!fitted && (sim?.alpha() ?? 1) < 0.08) fit();
        else draw();
      });
    };
    const pulseTimer = window.setInterval(() => {
      if (disposed || !selected) return;
      draw();
    }, 40);
    const localXY = (ev) => {
      const rect = canvas.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };
    const showTip = (id, sx, sy) => {
      if (!id) {
        tip.hidden = true;
        return;
      }
      const n = nodes.find((x3) => x3.id === id);
      if (!n) {
        tip.hidden = true;
        return;
      }
      tip.hidden = false;
      tip.style.left = `${sx + 12}px`;
      tip.style.top = `${sy + 12}px`;
      tip.innerHTML = `<div><strong>${escapeHtml(n.title)}</strong></div><div class="muted">${escapeHtml(n.type)}${n.status ? " \xB7 " + escapeHtml(n.status) : ""}</div>`;
    };
    canvas.addEventListener("pointerdown", (ev) => {
      canvas.setPointerCapture(ev.pointerId);
      const { x: x3, y: y3 } = localXY(ev);
      const world = screenToWorld(cam, x3, y3);
      const hitR = (NODE_RADIUS_SELECTED + 6) / Math.max(cam.k, 0.2);
      const id = hitNode(nodes, positionsOf(), world.x, world.y, hitR);
      pointer.mode = "pending";
      pointer.startX = x3;
      pointer.startY = y3;
      pointer.lastX = x3;
      pointer.lastY = y3;
      pointer.nodeId = id;
    });
    canvas.addEventListener("pointermove", (ev) => {
      const { x: x3, y: y3 } = localXY(ev);
      if (pointer.mode === "none") {
        const world = screenToWorld(cam, x3, y3);
        const hitR = (NODE_RADIUS + 4) / Math.max(cam.k, 0.2);
        const id = hitNode(nodes, positionsOf(), world.x, world.y, hitR);
        showTip(id, x3, y3);
        return;
      }
      const dx = x3 - pointer.startX;
      const dy = y3 - pointer.startY;
      if (pointer.mode === "pending" && dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
        pointer.mode = pointer.nodeId ? "drag" : "pan";
        if (pointer.mode === "drag" && pointer.nodeId) {
          const n = nodes.find((node) => node.id === pointer.nodeId);
          if (n) {
            const w = screenToWorld(cam, x3, y3);
            n.fx = w.x;
            n.fy = w.y;
            sim?.alphaTarget(0.25).restart();
          }
        }
      }
      if (pointer.mode === "pan") {
        cam = { ...cam, x: cam.x + (x3 - pointer.lastX), y: cam.y + (y3 - pointer.lastY) };
        draw();
      } else if (pointer.mode === "drag" && pointer.nodeId) {
        const n = nodes.find((node) => node.id === pointer.nodeId);
        if (n) {
          const w = screenToWorld(cam, x3, y3);
          n.fx = w.x;
          n.fy = w.y;
          draw();
        }
      }
      pointer.lastX = x3;
      pointer.lastY = y3;
    });
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("lostpointercapture", () => {
      if (pointer.mode !== "none") {
        if (pointer.mode === "drag" && pointer.nodeId) {
          const n = nodes.find((node) => node.id === pointer.nodeId);
          if (n) {
            n.fx = null;
            n.fy = null;
            sim?.alphaTarget(0.02);
          }
        }
        pointer.mode = "none";
        pointer.nodeId = null;
      }
    });
    function endPointer(ev) {
      const { x: x3, y: y3 } = localXY(ev);
      if (pointer.mode === "pending") {
        const world = screenToWorld(cam, x3, y3);
        const hitR = (NODE_RADIUS_SELECTED + 6) / Math.max(cam.k, 0.2);
        const id = hitNode(nodes, positionsOf(), world.x, world.y, hitR);
        selected = id && selected === id ? null : id;
        opts?.onSelect?.(selected);
        draw();
      }
      if (pointer.mode === "drag" && pointer.nodeId) {
        const n = nodes.find((node) => node.id === pointer.nodeId);
        if (n) {
          n.fx = null;
          n.fy = null;
          sim?.alphaTarget(0.02);
        }
      }
      pointer.mode = "none";
      pointer.nodeId = null;
    }
    canvas.addEventListener(
      "wheel",
      (ev) => {
        ev.preventDefault();
        const { x: x3, y: y3 } = localXY(ev);
        const factor = ev.deltaY > 0 ? 0.9 : 1.1;
        cam = zoomAt(cam, x3, y3, cam.k * factor);
        draw();
      },
      { passive: false }
    );
    hud.addEventListener("click", (ev) => {
      const t = ev.target;
      const act = t?.getAttribute("data-act");
      if (act === "fit") fit();
      if (act === "zoom-in") {
        cam = zoomAt(cam, wrap.clientWidth / 2, wrap.clientHeight / 2, cam.k * 1.2);
        draw();
      }
      if (act === "zoom-out") {
        cam = zoomAt(cam, wrap.clientWidth / 2, wrap.clientHeight / 2, cam.k * 0.8);
        draw();
      }
    });
    const focusNode = (id) => {
      const n = nodes.find((node) => node.id === id);
      if (!n || n.x == null || n.y == null) return;
      const k = cam.k;
      cam = {
        x: (wrap.clientWidth || 800) / 2 - n.x * k,
        y: (wrap.clientHeight || 560) / 2 - n.y * k,
        k
      };
      draw();
    };
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return {
      setGraph(next, setOpts) {
        const prev = selected;
        graph2 = next;
        tip.hidden = true;
        if (setOpts?.keepSelected && prev && next.nodes.some((n) => n.id === prev)) {
          selected = prev;
        } else {
          selected = null;
        }
        restartSim();
      },
      selectNode(id, focus = true) {
        selected = id;
        pulseT0 = performance.now();
        tip.hidden = true;
        opts?.onSelect?.(id);
        draw();
        if (id && focus) {
          requestAnimationFrame(() => focusNode(id));
        }
      },
      fit,
      dispose() {
        disposed = true;
        window.clearInterval(pulseTimer);
        sim?.stop();
        ro.disconnect();
        root.innerHTML = "";
      }
    };
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // src/webview/panel/markdownLite.ts
  function escapeHtml2(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function inline(s) {
    let t = escapeHtml2(s);
    t = t.replace(
      /`([^`]+)`/g,
      '<code style="font-family:ui-monospace,Consolas,monospace;font-size:12px;background:rgba(127,127,127,.2);padding:1px 5px;border-radius:4px">$1</code>'
    );
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(
      /\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g,
      (_m, a2, b) => `<span style="color:var(--vscode-textLink-foreground,#679efe)">${b || a2}</span>`
    );
    t = t.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:var(--vscode-textLink-foreground,#679efe)">$1</a>'
    );
    return t;
  }
  function renderMarkdownLite(src) {
    const body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
    const lines = body.replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let i = 0;
    let inCode = false;
    let codeBuf = [];
    let inUl = false;
    let inTable = false;
    let tableRows = [];
    const closeUl = () => {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
    };
    const flushTable = () => {
      if (!inTable) return;
      if (tableRows.length > 0) {
        out.push('<table class="md-table">');
        tableRows.forEach((cells, ri) => {
          const tag = ri === 0 ? "th" : "td";
          out.push("<tr>");
          for (const c2 of cells) out.push(`<${tag}>${inline(c2)}</${tag}>`);
          out.push("</tr>");
        });
        out.push("</table>");
      }
      inTable = false;
      tableRows = [];
    };
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("```")) {
        closeUl();
        flushTable();
        if (!inCode) {
          inCode = true;
          codeBuf = [];
        } else {
          out.push(`<pre class="md-pre"><code>${escapeHtml2(codeBuf.join("\n"))}</code></pre>`);
          inCode = false;
        }
        i++;
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        i++;
        continue;
      }
      if (/^\|(.+)\|$/.test(line.trim()) && !/^\|\s*-+/.test(line.trim())) {
        closeUl();
        if (!inTable) inTable = true;
        tableRows.push(
          line.trim().slice(1, -1).split("|").map((c2) => c2.trim())
        );
        i++;
        continue;
      }
      if (/^\|\s*-+/.test(line.trim())) {
        i++;
        continue;
      }
      flushTable();
      if (/^#{1,3}\s+/.test(line)) {
        closeUl();
        const m2 = line.match(/^(#{1,3})\s+(.+)$/);
        if (m2) out.push(`<h${m2[1].length}>${inline(m2[2])}</h${m2[1].length}>`);
        i++;
        continue;
      }
      if (/^>\s?/.test(line)) {
        closeUl();
        out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
        i++;
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        if (!inUl) {
          out.push("<ul>");
          inUl = true;
        }
        out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
        i++;
        continue;
      }
      if (line.trim() === "") {
        closeUl();
        i++;
        continue;
      }
      closeUl();
      out.push(`<p>${inline(line)}</p>`);
      i++;
    }
    closeUl();
    flushTable();
    if (inCode) out.push(`<pre class="md-pre"><code>${escapeHtml2(codeBuf.join("\n"))}</code></pre>`);
    return out.join("\n");
  }

  // src/webview/main.ts
  var vscode = acquireVsCodeApi();
  var statusEl = document.getElementById("status");
  var errEl = document.getElementById("error");
  var shellEl = document.getElementById("shell");
  var graphEl = document.getElementById("graph");
  var detailEl = document.getElementById("detail");
  var previewEl = document.getElementById("preview");
  var graph = null;
  var selectedId = null;
  var lastRevision = 0;
  var reqSeq = 0;
  var pending = /* @__PURE__ */ new Map();
  function call(endpoint, payload = {}) {
    const id = `req-${++reqSeq}`;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      vscode.postMessage({ type: "request", id, endpoint, payload });
    });
  }
  function escapeHtml3(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var view = mountGraph(graphEl, {
    onSelect(id) {
      selectedId = id;
      renderDetail(true);
      updateStatusSelected();
    }
  });
  function updateStatusSelected() {
    const base = statusEl.dataset.base || "";
    statusEl.textContent = selectedId ? `${base} \xB7 selected=${selectedId}` : base;
  }
  function showError(err) {
    errEl.hidden = false;
    shellEl.hidden = true;
    errEl.textContent = typeof err === "string" ? err : err.message || String(err);
  }
  function nodeById(id) {
    return graph?.nodes.find((n) => n.id === id);
  }
  function renderDetail(animate = false) {
    detailEl.classList.toggle("has-selection", Boolean(selectedId));
    if (animate) {
      detailEl.classList.remove("detail-pop");
      void detailEl.offsetWidth;
      detailEl.classList.add("detail-pop");
    }
    if (!selectedId || !graph) {
      detailEl.innerHTML = '<div class="detail-empty muted">\u70B9\u9009\u56FE\u8C31\u8282\u70B9\u6216\u4FA7\u680F\u76EE\u5F55\u67E5\u770B\u8BE6\u60C5</div>';
      shellEl.classList.remove("detail-open");
      return;
    }
    shellEl.classList.add("detail-open");
    const n = nodeById(selectedId);
    if (!n) {
      const slice = graph.slices?.find((s) => s.id === selectedId);
      if (slice) {
        detailEl.innerHTML = detailHtml({
          title: slice.title,
          kind: "\u5207\u7247",
          status: slice.status,
          theme: slice.theme,
          path: slice.path,
          summary: null
        });
        bindDetailActions(slice.path, slice.title);
        return;
      }
      detailEl.innerHTML = '<div class="detail-empty muted">\u672A\u627E\u5230\u8282\u70B9</div>';
      return;
    }
    detailEl.innerHTML = detailHtml({
      title: n.title,
      kind: n.type,
      status: n.status,
      theme: n.theme,
      path: n.path,
      summary: n.summary
    });
    bindDetailActions(n.path, n.title);
  }
  function detailHtml(d) {
    return `
    <div class="detail-h">${escapeHtml3(d.title)}</div>
    <div class="muted">${escapeHtml3(d.kind)}${d.status ? " \xB7 " + escapeHtml3(d.status) : ""}${d.theme ? " \xB7 " + escapeHtml3(d.theme) : ""}</div>
    <button type="button" class="detail-path linkish" id="btn-path" title="\u6253\u5F00\u6587\u4EF6">${escapeHtml3(d.path)}</button>
    ${d.summary ? `<p class="detail-sum">${escapeHtml3(d.summary)}</p>` : ""}
    <div class="detail-actions">
      <button type="button" id="btn-open" class="primary">\u6253\u5F00\u6587\u4EF6</button>
      <button type="button" id="btn-preview" class="secondary">\u53EA\u8BFB\u9884\u89C8</button>
    </div>`;
  }
  function bindDetailActions(relPath, title) {
    document.getElementById("btn-open")?.addEventListener("click", () => {
      void openFile(relPath);
    });
    document.getElementById("btn-path")?.addEventListener("click", () => {
      void openFile(relPath);
    });
    document.getElementById("btn-preview")?.addEventListener("click", () => {
      void openPreview(relPath, title);
    });
  }
  async function openFile(relPath) {
    try {
      await call("open", { path: relPath });
    } catch (e) {
      const msg = e.message || String(e);
      statusEl.textContent = `\u6253\u5F00\u5931\u8D25\uFF1A${msg}`;
    }
  }
  async function openPreview(relPath, title) {
    try {
      const res = await call("read", { path: relPath });
      previewEl.hidden = false;
      previewEl.innerHTML = `
      <div class="preview-card" role="dialog">
        <div class="preview-bar">
          <strong>${escapeHtml3(title)}</strong>
          <span class="pill">\u53EA\u8BFB</span>
          <span class="muted">${escapeHtml3(res.path)}</span>
          <button type="button" id="btn-open-from-preview" class="secondary">\u6253\u5F00\u6587\u4EF6</button>
          <button type="button" id="btn-preview-close">\u5173\u95ED</button>
        </div>
        <div class="preview-body md">${renderMarkdownLite(res.text)}</div>
      </div>`;
      document.getElementById("btn-preview-close")?.addEventListener("click", closePreview);
      document.getElementById("btn-open-from-preview")?.addEventListener("click", () => {
        void openFile(res.path);
      });
    } catch (e) {
      const msg = e.message || String(e);
      previewEl.hidden = false;
      previewEl.innerHTML = `
      <div class="preview-card">
        <div class="preview-bar"><strong>\u9884\u89C8\u5931\u8D25</strong><button type="button" id="btn-preview-close">\u5173\u95ED</button></div>
        <pre class="stub-json">${escapeHtml3(msg)}</pre>
      </div>`;
      document.getElementById("btn-preview-close")?.addEventListener("click", closePreview);
    }
  }
  function closePreview() {
    previewEl.hidden = true;
    previewEl.innerHTML = "";
  }
  function selectFromUi(id) {
    selectedId = id;
    view.selectNode(id, true);
    renderDetail(true);
    updateStatusSelected();
  }
  function applyGraph(g, keepSelected) {
    graph = g;
    errEl.hidden = true;
    shellEl.hidden = false;
    const wiki = g.edges.filter((e) => e.kind === "wikilink").length;
    const base = `docsRoot=${g.docsRoot} \xB7 nodes=${g.nodes.length} \xB7 edges=${g.edges.length} (wiki=${wiki}) \xB7 rev=${lastRevision}`;
    statusEl.dataset.base = base;
    statusEl.textContent = base + " \xB7 watching";
    view.setGraph(g, { keepSelected });
    if (keepSelected && selectedId) {
      view.selectNode(selectedId, false);
    } else if (!keepSelected) {
      selectedId = null;
    }
    renderDetail(false);
  }
  previewEl.addEventListener("click", (ev) => {
    if (ev.target === previewEl) closePreview();
  });
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closePreview();
  });
  async function load() {
    try {
      const g = await call("parse", {});
      applyGraph(g, false);
      const w = await call("watchStart", {});
      lastRevision = w.revision || 0;
      const base = statusEl.dataset.base?.replace(/ · rev=\d+/, ` \xB7 rev=${lastRevision}`) || "";
      statusEl.dataset.base = base;
      statusEl.textContent = base + " \xB7 watching";
      vscode.postMessage({ type: "ui", action: "ready" });
    } catch (e) {
      showError(e);
    }
  }
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg) return;
    if (msg.type === "response") {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.result);
      else p.reject(msg.error || { message: "unknown error" });
    }
    if (msg.type === "event" && msg.event === "revision") {
      lastRevision = msg.payload.revision;
      statusEl.textContent = `rev=${lastRevision} \xB7 refreshing\u2026`;
      call("parse", {}).then((g) => applyGraph(g, true)).catch((e) => showError(e));
    }
    if (msg.type === "event" && msg.event === "select") {
      const id = msg.payload?.id;
      if (id) selectFromUi(id);
    }
  });
  void load();
})();
