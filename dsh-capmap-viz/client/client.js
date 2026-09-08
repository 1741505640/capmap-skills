window.__ModuleLoader__.load({
	id: "@chenjh12/dsh-capmap-viz",
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
		  for (var name in all)
		    __defProp(target, name, { get: all[name], enumerable: true });
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
		  inject: () => inject
		});
		module.exports = __toCommonJS(index_exports);

		// src/client/panel-controller.ts
		var CapMapPanelController = class {
		  open = false;
		  listeners = /* @__PURE__ */ new Set();
		  getSnapshot() {
		    return { panelOpen: this.open };
		  }
		  isOpen() {
		    return this.open;
		  }
		  subscribe(listener) {
		    this.listeners.add(listener);
		    return () => {
		      this.listeners.delete(listener);
		    };
		  }
		  emit() {
		    for (const listener of this.listeners) listener();
		  }
		  openPanel() {
		    if (this.open) return;
		    this.open = true;
		    this.emit();
		  }
		  closePanel() {
		    if (!this.open) return;
		    this.open = false;
		    this.emit();
		  }
		  togglePanel() {
		    this.open = !this.open;
		    this.emit();
		  }
		};

		// src/client/panel-mount.tsx
		var import_react7 = require("react");

		// src/client/CapMapPanel.tsx
		var import_react6 = require("react");

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

		// src/client/graph/colors.ts
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

		// src/client/labels.ts
		var TYPE_LABELS = {
		  map: "\u5E95\u56FE",
		  scheme: "\u65B9\u6848",
		  test: "\u6D4B\u8BD5",
		  norm: "\u89C4\u8303",
		  index: "\u7D22\u5F15",
		  archive: "\u5F52\u6863",
		  slice: "\u5207\u7247",
		  overview: "\u5168\u8C8C"
		};
		var TYPE_FILTER_OPTIONS = [
		  { value: "\u5168\u90E8", label: "\u5168\u90E8" },
		  { value: "map", label: "\u5E95\u56FE" },
		  { value: "scheme", label: "\u65B9\u6848" },
		  { value: "test", label: "\u6D4B\u8BD5" },
		  { value: "norm", label: "\u89C4\u8303" },
		  { value: "index", label: "\u7D22\u5F15" },
		  { value: "archive", label: "\u5F52\u6863" },
		  { value: "overview", label: "\u5168\u8C8C" }
		];
		function typeLabel(type) {
		  return TYPE_LABELS[type] ?? type;
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
		function isArchiveNode(type, path) {
		  return type === "archive" || path.startsWith("_archive/") || path.includes("/_archive/");
		}
		var GraphCanvas = (0, import_react.forwardRef)(function GraphCanvas2({ graph, selected, onSelect, clusterThemes = true }, ref) {
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
		  const [charge, setCharge] = (0, import_react.useState)(220);
		  const [linkDist, setLinkDist] = (0, import_react.useState)(80);
		  const [centerForce, setCenterForce] = (0, import_react.useState)(30);
		  const [labelFade, setLabelFade] = (0, import_react.useState)(55);
		  const [animOn, setAnimOn] = (0, import_react.useState)(true);
		  const [zoomK, setZoomK] = (0, import_react.useState)(1);
		  const forceParamsRef = (0, import_react.useRef)({ charge, linkDist, centerForce, labelFade, animOn, clusterThemes });
		  forceParamsRef.current = { charge, linkDist, centerForce, labelFade, animOn, clusterThemes };
		  selectedRef.current = selected;
		  const positionsOf = () => {
		    const out = {};
		    for (const n of nodesRef.current) {
		      out[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
		    }
		    return out;
		  };
		  const labelThreshold = () => {
		    const fade = forceParamsRef.current.labelFade;
		    return 0.15 + (100 - fade) / 100 * 0.9;
		  };
		  const applyForces = (0, import_react.useCallback)((sim, W, H) => {
		    const p = forceParamsRef.current;
		    const themes = [...new Set(nodesRef.current.map((n) => n.theme).filter(Boolean))];
		    const existing = sim.force("link");
		    const links = existing?.links() ?? [];
		    sim.force(
		      "link",
		      link_default(links).id((d) => d.id).distance(p.linkDist).strength(0.55)
		    ).force("charge", manyBody_default().strength(-p.charge)).force("center", center_default(W / 2, H / 2)).force("collide", collide_default().radius((d) => d.archive ? 16 : 22)).force("cx", x_default2(W / 2).strength(p.centerForce / 100 * 0.15)).force("cy", y_default2(H / 2).strength(p.centerForce / 100 * 0.15));
		    if (p.clusterThemes && themes.length > 0) {
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
		      sim.force("x", null);
		      sim.force(
		        "y",
		        y_default2((d) => d.archive ? H * 0.72 : H * 0.5).strength(0.04)
		      );
		    }
		    sim.alphaTarget(p.animOn ? 0.02 : 0).restart();
		  }, []);
		  const draw = (0, import_react.useCallback)(() => {
		    try {
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
		      const thr = labelThreshold();
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
		        const baseR = n.archive ? NODE_RADIUS * 0.75 : NODE_RADIUS;
		        const r = (isSel ? NODE_RADIUS_SELECTED : baseR) * Math.min(cam.k, 1.4);
		        let alpha = active ? 1 : 0.18;
		        if (n.archive && active) alpha *= 0.55;
		        ctx.globalAlpha = alpha;
		        ctx.beginPath();
		        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
		        ctx.fillStyle = typeFill(n.type);
		        ctx.fill();
		        ctx.lineWidth = isSel ? 3.5 : 2.5;
		        ctx.strokeStyle = statusStroke(n.status);
		        ctx.setLineDash(statusDashed(n.status) || n.archive ? [4, 3] : []);
		        ctx.stroke();
		        ctx.setLineDash([]);
		        if (cam.k >= thr) {
		          const labelAlpha = Math.min(1, Math.max(0, (cam.k - thr) / 0.35));
		          ctx.globalAlpha = alpha * labelAlpha;
		          ctx.fillStyle = n.archive ? "#9ca3af" : "#e5e7eb";
		          ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
		          ctx.textAlign = "center";
		          ctx.textBaseline = "bottom";
		          const label = n.title.length > 16 ? `${n.title.slice(0, 16)}\u2026` : n.title;
		          ctx.fillText(label, s.x, s.y - r - 4);
		        }
		        ctx.globalAlpha = 1;
		      }
		      ctx.restore();
		    } catch {
		    }
		  }, [graph]);
		  const fit = (0, import_react.useCallback)(() => {
		    const wrap = wrapRef.current;
		    if (!wrap) return;
		    fittedRef.current = true;
		    const pts = nodesRef.current.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
		    camRef.current = fitTransform(pts, wrap.clientWidth, wrap.clientHeight);
		    setZoomK(camRef.current.k);
		    draw();
		  }, [draw]);
		  const exportPng = (0, import_react.useCallback)(
		    (filename = "capmap-graph.png") => {
		      const canvas = canvasRef.current;
		      if (!canvas) return;
		      draw();
		      const url = canvas.toDataURL("image/png");
		      const a2 = document.createElement("a");
		      a2.href = url;
		      a2.download = filename;
		      a2.click();
		    },
		    [draw]
		  );
		  const focusNode = (0, import_react.useCallback)(
		    (id) => {
		      const wrap = wrapRef.current;
		      const n = nodesRef.current.find((node) => node.id === id);
		      if (!wrap || !n || n.x == null || n.y == null) return;
		      const k = camRef.current.k;
		      camRef.current = {
		        x: wrap.clientWidth / 2 - n.x * k,
		        y: wrap.clientHeight / 2 - n.y * k,
		        k
		      };
		      draw();
		    },
		    [draw]
		  );
		  (0, import_react.useImperativeHandle)(ref, () => ({ fit, exportPng, focusNode }), [fit, exportPng, focusNode]);
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
		      summary: n.summary,
		      path: n.path,
		      theme: n.theme,
		      archive: isArchiveNode(n.type, n.path)
		    }));
		    const byId = new Set(nodes.map((n) => n.id));
		    const links = graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind) && byId.has(e.source) && byId.has(e.target)).map((e) => ({ source: e.source, target: e.target, kind: e.kind }));
		    nodesRef.current = nodes;
		    const wrap = wrapRef.current;
		    const W = wrap?.clientWidth || 800;
		    const H = wrap?.clientHeight || 560;
		    const p = forceParamsRef.current;
		    const themes = [...new Set(nodes.map((n) => n.theme).filter(Boolean))];
		    const sim = simulation_default(nodes).force("link", link_default(links).id((d) => d.id).distance(p.linkDist).strength(0.55)).force("charge", manyBody_default().strength(-p.charge)).force("center", center_default(W / 2, H / 2)).force("collide", collide_default().radius((d) => d.archive ? 16 : 22)).force("cx", x_default2(W / 2).strength(p.centerForce / 100 * 0.15)).force("cy", y_default2(H / 2).strength(p.centerForce / 100 * 0.15));
		    if (p.clusterThemes && themes.length > 0) {
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
		    sim.alphaTarget(p.animOn ? 0.02 : 0);
		    sim.on("tick", () => {
		      if (!fittedRef.current && sim.alpha() < 0.08) {
		        fittedRef.current = true;
		        const pts = nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
		        const el = wrapRef.current;
		        if (el) {
		          camRef.current = fitTransform(pts, el.clientWidth, el.clientHeight);
		          setZoomK(camRef.current.k);
		        }
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
		    const sim = simRef.current;
		    const wrap = wrapRef.current;
		    if (!sim || !wrap) return;
		    applyForces(sim, wrap.clientWidth || 800, wrap.clientHeight || 560);
		  }, [charge, linkDist, centerForce, animOn, clusterThemes, applyForces, size.w, size.h]);
		  (0, import_react.useEffect)(() => {
		    draw();
		  }, [selected, draw, size, labelFade]);
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
		      const n = ptr.nodeId ? nodesRef.current.find((node) => node.id === ptr.nodeId) : null;
		      if (n) {
		        n.fx = null;
		        n.fy = null;
		      }
		      simRef.current?.alphaTarget(forceParamsRef.current.animOn ? 0.02 : 0);
		    }
		    pointerRef.current = { mode: "none", startX: 0, startY: 0, lastX: 0, lastY: 0, nodeId: null };
		    try {
		      ev.currentTarget.releasePointerCapture(ev.pointerId);
		    } catch {
		    }
		  };
		  const onWheel = (ev) => {
		    ev.preventDefault();
		    const rect = ev.currentTarget.getBoundingClientRect();
		    const x3 = ev.clientX - rect.left;
		    const y3 = ev.clientY - rect.top;
		    const factor = ev.deltaY > 0 ? 0.92 : 1.08;
		    camRef.current = zoomAt(camRef.current, x3, y3, camRef.current.k * factor);
		    setZoomK(camRef.current.k);
		    draw();
		  };
		  const bumpZoom = (factor) => {
		    const wrap = wrapRef.current;
		    if (!wrap) return;
		    const x3 = wrap.clientWidth / 2;
		    const y3 = wrap.clientHeight / 2;
		    camRef.current = zoomAt(camRef.current, x3, y3, camRef.current.k * factor);
		    setZoomK(camRef.current.k);
		    draw();
		  };
		  const hoverNode = hover ? graph.nodes.find((n) => n.id === hover.id) : null;
		  const hoverDeg = hover ? degree(hover.id, graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind)), VISIBLE_KINDS) : 0;
		  const hudBtn = {
		    flex: 1,
		    height: 26,
		    borderRadius: 6,
		    border: "1px solid var(--dsw-alias-border-l2, #374151)",
		    background: "var(--dsw-alias-button-elevated-fill, #1f2937)",
		    color: "var(--dsw-alias-label-primary, #e5e7eb)",
		    fontSize: 12,
		    cursor: "pointer"
		  };
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
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		      "div",
		      {
		        style: {
		          position: "absolute",
		          right: 10,
		          bottom: 10,
		          zIndex: 4,
		          width: 188,
		          padding: 8,
		          borderRadius: 8,
		          border: "1px solid var(--dsw-alias-border-l2, #374151)",
		          background: "var(--dsw-alias-bg-layer-1, #111827)"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 4, marginBottom: 8 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: hudBtn, onClick: () => bumpZoom(1 / 1.12), title: "\u7F29\u5C0F", children: "\u2212" }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: hudBtn, onClick: fit, title: "\u9002\u5E94", children: "Fit" }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: hudBtn, onClick: () => bumpZoom(1.12), title: "\u653E\u5927", children: "+" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudSlider, { label: "\u65A5\u529B", value: charge, min: 80, max: 400, onChange: setCharge }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudSlider, { label: "\u8DDD\u79BB", value: linkDist, min: 40, max: 180, onChange: setLinkDist }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudSlider, { label: "\u4E2D\u5FC3", value: centerForce, min: 0, max: 100, onChange: setCenterForce }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudSlider, { label: "\u6807\u7B7E", value: labelFade, min: 0, max: 100, onChange: setLabelFade }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		            "button",
		            {
		              type: "button",
		              onClick: () => setAnimOn((v) => !v),
		              style: {
		                ...hudBtn,
		                width: "100%",
		                marginTop: 8,
		                flex: "none",
		                background: animOn ? "var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))" : "var(--dsw-alias-button-elevated-fill, #1f2937)"
		              },
		              children: [
		                "\u52A8\u753B\uFF1A",
		                animOn ? "\u5F00" : "\u5173"
		              ]
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 8, fontSize: 10, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: [
		            "\u7F29\u653E ",
		            zoomK.toFixed(2),
		            " \xB7 \u6EDA\u8F6E / \u62D6\u52A8\u753B\u5E03"
		          ] })
		        ]
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
		          background: "var(--dsw-alias-bg-layer-1, #111827)",
		          border: "1px solid var(--dsw-alias-border-l2, #374151)",
		          color: "var(--dsw-alias-label-primary, #e5e7eb)",
		          fontSize: 12,
		          pointerEvents: "none",
		          zIndex: 2
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600, marginBottom: 4 }, children: hoverNode.title }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: "var(--dsw-alias-label-secondary, #9ca3af)" }, children: [
		            "\u7C7B\u578B ",
		            typeLabel(hoverNode.type),
		            " \xB7 \u72B6\u6001 ",
		            hoverNode.status ?? "\u2014",
		            isArchiveNode(hoverNode.type, hoverNode.path) ? " \xB7 \u5F52\u6863\u5C42" : ""
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: "var(--dsw-alias-label-secondary, #9ca3af)" }, children: [
		            "\u5EA6\u6570 ",
		            hoverDeg
		          ] }),
		          hoverNode.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginTop: 6, color: "var(--dsw-alias-label-secondary, #cbd5e1)" }, children: hoverNode.summary.length > 80 ? `${hoverNode.summary.slice(0, 80)}\u2026` : hoverNode.summary })
		        ]
		      }
		    )
		  ] });
		});
		function HudSlider({
		  label,
		  value,
		  min,
		  max,
		  onChange
		}) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "label",
		    {
		      style: {
		        display: "flex",
		        alignItems: "center",
		        gap: 6,
		        marginTop: 6,
		        fontSize: 10,
		        color: "var(--dsw-alias-label-secondary, #9ca3af)"
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: 28, flex: "none" }, children: label }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "input",
		          {
		            type: "range",
		            min,
		            max,
		            value,
		            onChange: (e) => onChange(Number(e.target.value)),
		            style: { flex: 1, minWidth: 0, accentColor: "var(--dsw-alias-button-info-fill, #679efe)" }
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "b",
		          {
		            style: {
		              width: 28,
		              flex: "none",
		              textAlign: "right",
		              fontWeight: 500,
		              color: "var(--dsw-alias-label-tertiary, #6b7280)"
		            },
		            children: value
		          }
		        )
		      ]
		    }
		  );
		}

		// src/client/panel/CapabilityPanel.tsx
		var import_react2 = require("react");

		// src/parser/queries.ts
		function stripStatusPrefix(raw) {
		  if (raw == null || raw === "") return null;
		  const t = raw.trim();
		  return t.startsWith("\u72B6\u6001/") ? t.slice("\u72B6\u6001/".length) : t;
		}
		function themeMatch(theme, filter) {
		  if (!filter || filter === "\u5168\u90E8") return true;
		  return theme === filter;
		}
		function alignCapabilityToScheme(cap, schemes) {
		  const inTheme = schemes.filter((s) => themeMatch(s.theme, cap.theme));
		  if (cap.schemeWikilink) {
		    const stem = cap.schemeWikilink.replace(/\.md$/i, "");
		    const hit = inTheme.find((s) => s.id === stem) ?? schemes.find((s) => s.id === stem);
		    return hit ?? null;
		  }
		  const name = cap.name.replace(/\[\[|\]\]/g, "").trim();
		  const norm = (s) => s.replace(/[（）()【】\[\]\s·\-—_/]/g, "").toLowerCase();
		  const nameN = norm(name);
		  const pool = inTheme.length ? inTheme : schemes;
		  const exact = pool.filter((s) => s.title === name || s.id === name || norm(s.title) === nameN);
		  if (exact.length === 1) return exact[0];
		  if (exact.length > 1) return null;
		  const contains = pool.filter((s) => {
		    const t = norm(s.title);
		    const id = norm(s.id);
		    return t.includes(nameN) || nameN.includes(t) || id.includes(nameN) || nameN.includes(id) || s.title.includes(name) || name.includes(s.title);
		  });
		  if (contains.length === 1) return contains[0];
		  return null;
		}
		function deriveFrontier(slices, themeFilter = null) {
		  const byId = new Map(slices.map((s) => [s.id, s]));
		  const out = [];
		  for (const s of slices) {
		    if (!themeMatch(s.theme, themeFilter)) continue;
		    if (stripStatusPrefix(s.status) !== "\u5F85\u5F00\u53D1") continue;
		    const depsOk = (s.blockedBy ?? []).every((dep) => {
		      const d = byId.get(dep);
		      return d != null && stripStatusPrefix(d.status) === "\u5DF2\u9A8C\u6536";
		    });
		    if (!depsOk) continue;
		    out.push({
		      kind: "frontier",
		      id: `frontier:${s.id}`,
		      label: s.title,
		      schemeId: s.schemeId,
		      detail: (s.blockedBy ?? []).length ? `Blocked by: ${s.blockedBy.join(", ")}` : "\u65E0\u4F9D\u8D56"
		    });
		  }
		  return out;
		}
		function deriveValidationGate(nodes, themeFilter = null) {
		  const schemes = nodes.filter((n) => n.type === "scheme" && themeMatch(n.theme, themeFilter));
		  const tests = nodes.filter((n) => n.type === "test");
		  const out = [];
		  for (const scheme of schemes) {
		    const st = stripStatusPrefix(scheme.status);
		    if (!st) continue;
		    if (st === "\u5F00\u53D1\u4E2D" || st === "\u65B9\u6848\u4E2D" || st === "\u5DF2\u786E\u8BA4" || st === "\u89C4\u683C\u4E2D" || st === "\u5DF2\u62C6\u5206") {
		      continue;
		    }
		    const linked = tests.filter((t) => {
		      if (!themeMatch(t.theme, themeFilter === "\u5168\u90E8" ? null : themeFilter ?? scheme.theme)) {
		      }
		      const sameTheme = t.theme && scheme.theme && t.theme === scheme.theme;
		      const mentions = t.summary && t.summary.includes(scheme.id) || t.title.includes(scheme.title) || t.id.includes(scheme.id);
		      return Boolean(sameTheme || mentions);
		    });
		    const verified = linked.filter((t) => stripStatusPrefix(t.status) === "\u5DF2\u9A8C\u8BC1");
		    const testing = linked.filter((t) => stripStatusPrefix(t.status) === "\u6D4B\u8BD5\u4E2D");
		    if (st === "\u5DF2\u5F00\u53D1" || st === "\u9A8C\u8BC1\u4E2D") {
		      if (verified.length === 0) {
		        out.push({
		          kind: "validation_gate",
		          id: `gate:${scheme.id}:no-verified`,
		          label: scheme.title,
		          schemeId: scheme.id,
		          detail: linked.length ? `\u72B6\u6001 ${st}\uFF0C\u5173\u8054\u6D4B\u8BD5\u65E0\u300C\u5DF2\u9A8C\u8BC1\u300D` : `\u72B6\u6001 ${st}\uFF0C\u65E0\u5173\u8054\u6D4B\u8BD5\u6587`,
		          schemeStatus: st
		        });
		      }
		    } else if (st === "\u5DF2\u9A8C\u8BC1") {
		      if (testing.length > 0 && verified.length === 0) {
		        out.push({
		          kind: "validation_gate",
		          id: `gate:${scheme.id}:test-lag`,
		          label: scheme.title,
		          schemeId: scheme.id,
		          detail: `\u65B9\u6848\u5DF2\u9A8C\u8BC1\uFF0C\u6D4B\u8BD5\u6587\u4ECD\u300C\u6D4B\u8BD5\u4E2D\u300D`,
		          schemeStatus: st
		        });
		      }
		    } else if (st === "\u843D\u5730\u4E2D" || st === "\u5DF2\u843D\u5730") {
		      if (verified.length === 0) {
		        out.push({
		          kind: "validation_gate",
		          id: `gate:${scheme.id}:skip`,
		          label: scheme.title,
		          schemeId: scheme.id,
		          detail: `\u8DF3\u6B65\u81F3 ${st}\uFF08\u65E0\u5DF2\u9A8C\u8BC1\u6D4B\u8BD5\uFF0C\u4EC5\u5C55\u793A\uFF09`,
		          schemeStatus: st
		        });
		      }
		    }
		  }
		  return out;
		}
		function deriveSection1Fight(capabilities, nodes, themeFilter = null) {
		  const schemes = nodes.filter((n) => n.type === "scheme");
		  const out = [];
		  for (const cap of capabilities) {
		    if (!themeMatch(cap.theme, themeFilter)) continue;
		    const scheme = alignCapabilityToScheme(cap, schemes);
		    if (!scheme) continue;
		    if (!themeMatch(scheme.theme, themeFilter)) continue;
		    const left = stripStatusPrefix(cap.status);
		    const right = stripStatusPrefix(scheme.status);
		    if (left == null || right == null) continue;
		    if (left === right) continue;
		    out.push({
		      kind: "section1_fight",
		      id: `fight:${cap.mapId ?? "map"}:${cap.name}:${scheme.id}`,
		      label: cap.name.replace(/\[\[([^\]]+)\]\]/g, "$1"),
		      schemeId: scheme.id,
		      mapId: cap.mapId,
		      detail: `\xA71\u300C${left}\u300Dvs Tag\u300C${right}\u300D`,
		      section1Status: left,
		      schemeStatus: right
		    });
		  }
		  return out;
		}
		function deriveQueries(nodes, capabilities, slices, themeFilter = null) {
		  return {
		    frontier: deriveFrontier(slices, themeFilter),
		    validationGate: deriveValidationGate(nodes, themeFilter),
		    section1Fight: deriveSection1Fight(capabilities, nodes, themeFilter)
		  };
		}

		// src/client/panel/themeTree.ts
		function isArchivedNode(n) {
		  return n.type === "archive" || n.path.startsWith("_archive/") || n.status === "\u5DF2\u5F52\u6863" || n.tags.includes("\u5DF2\u5F52\u6863") || n.tags.includes("\u72B6\u6001/\u5DF2\u5F52\u6863");
		}
		function leafOf(n) {
		  return { id: n.id, title: n.title, type: n.type, status: n.status };
		}
		function sliceLeaf(s) {
		  return { id: s.id, title: s.title, type: "slice", status: s.status };
		}
		function linkedDocIds(schemeId, edges) {
		  const out = /* @__PURE__ */ new Set();
		  for (const e of edges) {
		    if (e.kind !== "wikilink") continue;
		    if (e.source === schemeId) out.add(e.target);
		    if (e.target === schemeId) out.add(e.source);
		  }
		  return out;
		}
		function buildThemeTree(graph, themeFilter) {
		  const nodes = graph.nodes;
		  const byId = new Map(nodes.map((n) => [n.id, n]));
		  const themeNames = /* @__PURE__ */ new Set();
		  for (const n of nodes) {
		    if (themeFilter !== "\u5168\u90E8" && n.theme !== themeFilter) continue;
		    if (n.theme) themeNames.add(n.theme);
		  }
		  const buckets = [];
		  for (const theme of [...themeNames].sort()) {
		    const inTheme = (n) => n.theme === theme;
		    const maps = nodes.filter((n) => inTheme(n) && n.type === "map").map(leafOf);
		    const schemes = nodes.filter(
		      (n) => inTheme(n) && n.type !== "index" && !n.path.includes("/\u5207\u7247/") && (n.type === "scheme" || n.type === "archive" && n.path.includes("/\u65B9\u6848/") && !/索引\.md$/.test(n.path))
		    );
		    const active = [];
		    const archived = [];
		    const claimed2 = /* @__PURE__ */ new Set();
		    for (const sch of schemes) {
		      const archivedFlag = isArchivedNode(sch);
		      const links = linkedDocIds(sch.id, graph.edges);
		      const slices = (graph.slices ?? []).filter((s) => s.schemeId === sch.id || s.schemeId === sch.title).map(sliceLeaf);
		      const tests = [];
		      const norms = [];
		      for (const id of links) {
		        const n = byId.get(id);
		        if (!n) continue;
		        if (n.type === "test") {
		          tests.push(leafOf(n));
		          claimed2.add(n.id);
		        } else if (n.type === "norm") {
		          norms.push(leafOf(n));
		          claimed2.add(n.id);
		        }
		      }
		      const group = {
		        schemeId: sch.id,
		        title: sch.title,
		        status: sch.status,
		        archived: archivedFlag,
		        scheme: leafOf(sch),
		        slices,
		        tests,
		        norms
		      };
		      if (archivedFlag) archived.push(group);
		      else active.push(group);
		    }
		    const ungrouped = [];
		    for (const n of nodes) {
		      if (!inTheme(n)) continue;
		      if (n.type !== "test" && n.type !== "norm") continue;
		      if (claimed2.has(n.id)) continue;
		      ungrouped.push(leafOf(n));
		    }
		    buckets.push({ theme, maps, active, ungrouped, archived });
		  }
		  if (themeFilter === "\u5168\u90E8") {
		    const claimedAll = /* @__PURE__ */ new Set();
		    for (const b of buckets) {
		      for (const g of [...b.active, ...b.archived]) {
		        for (const t of g.tests) claimedAll.add(t.id);
		        for (const n of g.norms) claimedAll.add(n.id);
		      }
		      for (const u of b.ungrouped) claimedAll.add(u.id);
		    }
		    const unlinked = nodes.filter((n) => {
		      if (n.type !== "norm" && !(n.type === "test" && !n.theme)) return false;
		      if (claimedAll.has(n.id)) return false;
		      if (n.theme && themeNames.has(n.theme)) return false;
		      return true;
		    });
		    if (unlinked.length > 0) {
		      buckets.push({
		        theme: "\uFF08\u672A\u5F52\u7EC4\uFF09",
		        maps: [],
		        active: [],
		        ungrouped: unlinked.map(leafOf),
		        archived: []
		      });
		    }
		  }
		  return buckets;
		}
		var INDEX_ORDER = ["\u6587\u6863\u9996\u9875", "\u9879\u76EE\u5168\u8C8C", "\u65B9\u6848\u7D22\u5F15", "\u6D4B\u8BD5\u7D22\u5F15", "\u89C4\u8303\u7D22\u5F15", "\u5F52\u6863\u7D22\u5F15", "\u80FD\u529B\u603B\u89C8"];
		function listIndexNodes(nodes) {
		  const indexes = nodes.filter((n) => n.type === "index" || n.type === "overview").map(leafOf);
		  indexes.sort((a2, b) => {
		    const ia = INDEX_ORDER.findIndex((k) => a2.id.includes(k) || a2.title.includes(k));
		    const ib = INDEX_ORDER.findIndex((k) => b.id.includes(k) || b.title.includes(k));
		    if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
		    return a2.title.localeCompare(b.title, "zh");
		  });
		  return indexes;
		}
		function lifecycleCounts(nodes, themeFilter) {
		  const m2 = /* @__PURE__ */ new Map();
		  for (const n of nodes) {
		    if (themeFilter !== "\u5168\u90E8" && n.theme !== themeFilter) continue;
		    if (!n.status) continue;
		    m2.set(n.status, (m2.get(n.status) ?? 0) + 1);
		  }
		  const order = [
		    "\u65B9\u6848\u4E2D",
		    "\u5DF2\u786E\u8BA4",
		    "\u89C4\u683C\u4E2D",
		    "\u5DF2\u62C6\u5206",
		    "\u5F00\u53D1\u4E2D",
		    "\u5DF2\u5F00\u53D1",
		    "\u9A8C\u8BC1\u4E2D",
		    "\u5DF2\u9A8C\u8BC1",
		    "\u6D4B\u8BD5\u4E2D",
		    "\u843D\u5730\u4E2D",
		    "\u5DF2\u843D\u5730",
		    "\u5DF2\u5F52\u6863",
		    "\u5F85\u5F00\u53D1",
		    "\u5F85\u9A8C\u6536",
		    "\u5DF2\u9A8C\u6536"
		  ];
		  const entries = [...m2.entries()];
		  entries.sort((a2, b) => {
		    const ia = order.indexOf(a2[0]);
		    const ib = order.indexOf(b[0]);
		    if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
		    return b[1] - a2[1];
		  });
		  return entries.map(([status, count]) => ({ status, count }));
		}

		// src/client/panel/CapabilityPanel.tsx
		var import_jsx_runtime2 = require("react/jsx-runtime");
		var sectionTitle = {
		  fontSize: 11,
		  fontWeight: 600,
		  color: "var(--dsw-alias-label-secondary, #9ca3af)",
		  padding: "8px 10px 4px"
		};
		var rowBtn = (active) => ({
		  display: "block",
		  width: "100%",
		  textAlign: "left",
		  padding: "6px 10px",
		  border: "none",
		  borderRadius: 4,
		  background: active ? "var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))" : "transparent",
		  color: "var(--dsw-alias-label-primary, #e5e7eb)",
		  cursor: "pointer",
		  fontSize: 12
		});
		var panelShell = {
		  height: "100%",
		  overflow: "auto",
		  background: "var(--dsw-alias-bg-layer-1, #0b1220)"
		};
		function LiveBoard({ graph, themeFilter, selected, onSelectQuery }) {
		  const queries = (0, import_react2.useMemo)(
		    () => deriveQueries(
		      graph.nodes ?? [],
		      graph.capabilities ?? [],
		      graph.slices ?? [],
		      themeFilter === "\u5168\u90E8" ? null : themeFilter
		    ),
		    [graph, themeFilter]
		  );
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: panelShell, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: sectionTitle, children: "\u6D3B\u770B\u677F" }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      QueryBlock,
		      {
		        title: `frontier \u53EF\u5F00\uFF08${queries.frontier.length}\uFF09`,
		        emptyLabel: "\u53EF\u5F00 0",
		        rows: queries.frontier,
		        selected,
		        onSelectQuery
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      QueryBlock,
		      {
		        title: `\u9A8C\u8BC1\u95E8\u5361\u4F4F\uFF08${queries.validationGate.length}\uFF09`,
		        emptyLabel: "\u65E0\u5361\u4F4F\u9879",
		        rows: queries.validationGate,
		        selected,
		        onSelectQuery
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      QueryBlock,
		      {
		        title: `\xA71 \u4E0E Tag \u6253\u67B6\uFF08${queries.section1Fight.length}\uFF09`,
		        emptyLabel: "\u65E0\u6253\u67B6",
		        rows: queries.section1Fight,
		        selected,
		        onSelectQuery
		      }
		    )
		  ] });
		}
		function ThemeTreePanel({
		  graph,
		  themeFilter,
		  statusFilter,
		  selected,
		  onSelect,
		  onStatusFilter
		}) {
		  const indexes = (0, import_react2.useMemo)(() => listIndexNodes(graph.nodes), [graph.nodes]);
		  const buckets = (0, import_react2.useMemo)(() => buildThemeTree(graph, themeFilter), [graph, themeFilter]);
		  const life = (0, import_react2.useMemo)(() => lifecycleCounts(graph.nodes, themeFilter), [graph.nodes, themeFilter]);
		  const maxLife = Math.max(1, ...life.map((x3) => x3.count));
		  const [indexOpen, setIndexOpen] = (0, import_react2.useState)(true);
		  const [openThemes, setOpenThemes] = (0, import_react2.useState)({});
		  const [openGroups, setOpenGroups] = (0, import_react2.useState)({});
		  const themeOpen = (t) => openThemes[t] ?? true;
		  const groupOpen = (key) => openGroups[key] ?? false;
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { ...panelShell, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...sectionTitle, flex: "none" }, children: "\u76EE\u5F55" }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { flex: 1, minHeight: 0, overflow: "auto", paddingBottom: 8 }, children: [
		      indexes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		          "button",
		          {
		            type: "button",
		            style: {
		              ...rowBtn(false),
		              fontWeight: 600,
		              display: "flex",
		              alignItems: "center",
		              gap: 6
		            },
		            onClick: () => setIndexOpen((v) => !v),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { opacity: 0.7 }, children: indexOpen ? "\u25BE" : "\u25B8" }),
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { flex: 1 }, children: "\u7D22\u5F15" }),
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: indexes.length })
		            ]
		          }
		        ),
		        indexOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { paddingLeft: 8 }, children: indexes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: n, selected, onSelect: (id) => onSelect(id) }, n.id)) })
		      ] }),
		      (buckets.length > 0 || indexes.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        "div",
		        {
		          style: {
		            fontSize: 10,
		            fontWeight: 600,
		            color: "var(--dsw-alias-label-tertiary, #6b7280)",
		            padding: "10px 10px 2px",
		            letterSpacing: "0.04em"
		          },
		          children: "\u4E3B\u9898"
		        }
		      ),
		      buckets.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { padding: "4px 12px", fontSize: 12, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: "\u65E0\u4E3B\u9898" }),
		      buckets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		          "button",
		          {
		            type: "button",
		            style: {
		              ...rowBtn(false),
		              fontWeight: 600,
		              display: "flex",
		              alignItems: "center",
		              gap: 6
		            },
		            onClick: () => setOpenThemes((m2) => ({ ...m2, [b.theme]: !themeOpen(b.theme) })),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { opacity: 0.7 }, children: themeOpen(b.theme) ? "\u25BE" : "\u25B8" }),
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { flex: 1 }, children: b.theme }),
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: [
		                "\u8FDB\u884C\u4E2D ",
		                b.active.length
		              ] })
		            ]
		          }
		        ),
		        themeOpen(b.theme) && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { paddingLeft: 8 }, children: [
		          b.maps.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: n, selected, onSelect: (id) => onSelect(id) }, n.id)),
		          b.active.map((g) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            SchemeGroupBlock,
		            {
		              group: g,
		              open: groupOpen(`a:${g.schemeId}`),
		              onToggle: () => setOpenGroups((m2) => ({ ...m2, [`a:${g.schemeId}`]: !groupOpen(`a:${g.schemeId}`) })),
		              selected,
		              onSelect: (id) => onSelect(id)
		            },
		            g.schemeId
		          )),
		          b.ungrouped.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...sectionTitle, paddingLeft: 10 }, children: "\u672A\u5F52\u7EC4" }),
		            b.ungrouped.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: n, selected, onSelect: (id) => onSelect(id) }, n.id))
		          ] }),
		          b.archived.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            SchemeGroupBlock,
		            {
		              group: {
		                schemeId: `__archive__:${b.theme}`,
		                title: "\u843D\u5730\u5F52\u6863",
		                status: null,
		                archived: true,
		                scheme: null,
		                slices: [],
		                tests: [],
		                norms: []
		              },
		              open: groupOpen(`ar:${b.theme}`),
		              onToggle: () => setOpenGroups((m2) => ({ ...m2, [`ar:${b.theme}`]: !groupOpen(`ar:${b.theme}`) })),
		              selected,
		              onSelect,
		              nested: b.archived,
		              nestedOpen: openGroups,
		              setNestedOpen: setOpenGroups
		            },
		            "archive-root"
		          )
		        ] })
		      ] }, b.theme))
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		      "div",
		      {
		        style: {
		          flex: "none",
		          borderTop: "1px solid var(--dsw-alias-border-l2, #1f2937)",
		          padding: "4px 0 8px"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: sectionTitle, children: "\u751F\u547D\u5468\u671F" }),
		          life.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { padding: "4px 12px", fontSize: 12, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: "\u65E0\u72B6\u6001" }) : life.map(({ status, count }) => {
		            const on = statusFilter === status;
		            return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		              "button",
		              {
		                type: "button",
		                onClick: () => onStatusFilter(on ? "\u5168\u90E8" : status),
		                style: {
		                  display: "flex",
		                  alignItems: "center",
		                  gap: 8,
		                  width: "100%",
		                  border: 0,
		                  background: on ? "var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))" : "transparent",
		                  color: "var(--dsw-alias-label-primary, #e5e7eb)",
		                  padding: "5px 10px",
		                  fontSize: 12,
		                  cursor: "pointer",
		                  textAlign: "left"
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		                    "span",
		                    {
		                      style: {
		                        width: 8,
		                        height: 8,
		                        borderRadius: 99,
		                        flex: "none",
		                        background: statusStroke(status)
		                      }
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { width: 48, flex: "none", fontSize: 11 }, children: status }),
		                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		                    "span",
		                    {
		                      style: {
		                        flex: 1,
		                        height: 4,
		                        borderRadius: 99,
		                        background: "var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))",
		                        overflow: "hidden"
		                      },
		                      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		                        "i",
		                        {
		                          style: {
		                            display: "block",
		                            height: "100%",
		                            width: `${Math.round(count / maxLife * 100)}%`,
		                            background: statusStroke(status),
		                            borderRadius: 99
		                          }
		                        }
		                      )
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		                    "span",
		                    {
		                      style: {
		                        width: 18,
		                        textAlign: "right",
		                        fontSize: 11,
		                        color: "var(--dsw-alias-label-tertiary, #6b7280)"
		                      },
		                      children: count
		                    }
		                  )
		                ]
		              },
		              status
		            );
		          })
		        ]
		      }
		    )
		  ] });
		}
		function LeafRow({
		  leaf,
		  selected,
		  onSelect
		}) {
		  const isIndex = leaf.type === "index";
		  const dot = leaf.type === "map" ? "var(--dsw-static-deepseek-400, #679efe)" : leaf.type === "scheme" || leaf.type === "archive" ? "var(--dsw-static-green-500, #22c55e)" : leaf.type === "test" || leaf.type === "slice" ? "var(--dsw-static-amber-500, #f59e0b)" : isIndex ? "var(--dsw-alias-label-tertiary, #6b7280)" : "var(--dsw-static-deepseek-300, #b7c8fe)";
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		    "button",
		    {
		      type: "button",
		      style: {
		        ...rowBtn(selected === leaf.id),
		        display: "flex",
		        alignItems: "center",
		        gap: 8,
		        padding: "5px 8px"
		      },
		      onClick: () => onSelect(leaf.id, leaf.type),
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "span",
		          {
		            style: {
		              width: 8,
		              height: 8,
		              borderRadius: isIndex ? 2 : 99,
		              background: dot,
		              flex: "none"
		            }
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "span",
		          {
		            style: {
		              flex: 1,
		              minWidth: 0,
		              overflow: "hidden",
		              textOverflow: "ellipsis",
		              whiteSpace: "nowrap"
		            },
		            children: leaf.title
		          }
		        ),
		        leaf.status && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { flex: "none", fontSize: 10, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: leaf.status })
		      ]
		    }
		  );
		}
		function SchemeGroupBlock({
		  group,
		  open,
		  onToggle,
		  selected,
		  onSelect,
		  nested,
		  nestedOpen,
		  setNestedOpen
		}) {
		  const isArchiveRoot = group.schemeId.startsWith("__archive__:");
		  const selectLeaf = (id, leafType) => {
		    if (leafType === "slice") onSelect(group.schemeId);
		    else onSelect(id, leafType);
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		      "button",
		      {
		        type: "button",
		        style: {
		          ...rowBtn(false),
		          fontWeight: 600,
		          display: "flex",
		          alignItems: "center",
		          gap: 6
		        },
		        onClick: onToggle,
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { opacity: 0.7 }, children: open ? "\u25BE" : "\u25B8" }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: group.title }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: isArchiveRoot ? String(nested?.length ?? 0) : group.status ?? "" })
		        ]
		      }
		    ),
		    open && !isArchiveRoot && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { paddingLeft: 10 }, children: [
		      (group.scheme || group.slices.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KindLabel, { children: group.slices.length > 0 ? "\u65B9\u6848 / \u5207\u7247" : "\u65B9\u6848" }),
		        group.scheme && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: group.scheme, selected, onSelect: selectLeaf }),
		        group.slices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: s, selected, onSelect: selectLeaf }, s.id))
		      ] }),
		      group.tests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KindLabel, { children: "\u6D4B\u8BD5" }),
		        group.tests.map((t) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: t, selected, onSelect: selectLeaf }, t.id))
		      ] }),
		      group.norms.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KindLabel, { children: "\u89C4\u8303" }),
		        group.norms.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LeafRow, { leaf: n, selected, onSelect: selectLeaf }, `${group.schemeId}:${n.id}`))
		      ] })
		    ] }),
		    open && isArchiveRoot && nested && setNestedOpen && nestedOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { paddingLeft: 10 }, children: nested.map((g) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      SchemeGroupBlock,
		      {
		        group: g,
		        open: nestedOpen[`n:${g.schemeId}`] ?? false,
		        onToggle: () => setNestedOpen((m2) => ({ ...m2, [`n:${g.schemeId}`]: !(m2[`n:${g.schemeId}`] ?? false) })),
		        selected,
		        onSelect
		      },
		      g.schemeId
		    )) })
		  ] });
		}
		function KindLabel({ children }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		    "div",
		    {
		      style: {
		        fontSize: 10,
		        fontWeight: 600,
		        color: "var(--dsw-alias-label-tertiary, #6b7280)",
		        padding: "6px 8px 2px",
		        letterSpacing: "0.04em"
		      },
		      children
		    }
		  );
		}
		function QueryBlock({
		  title,
		  emptyLabel,
		  rows,
		  selected,
		  onSelectQuery
		}) {
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: sectionTitle, children: title }),
		    rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { padding: "4px 10px 8px", fontSize: 12, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: emptyLabel }) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		      "button",
		      {
		        type: "button",
		        style: rowBtn(selected === r.schemeId),
		        onClick: () => onSelectQuery(r),
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: r.label }),
		          r.detail && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 10, color: "var(--dsw-alias-label-secondary, #9ca3af)" }, children: r.detail })
		        ]
		      },
		      r.id
		    ))
		  ] });
		}

		// src/client/detail/NodeDetail.tsx
		var import_react3 = require("react");
		var import_jsx_runtime3 = require("react/jsx-runtime");
		function NodeDetail({
		  graph,
		  selected,
		  queryHint,
		  onClose,
		  onSelectNeighbor,
		  onOpenSource
		}) {
		  const node = (0, import_react3.useMemo)(
		    () => selected ? graph.nodes.find((n) => n.id === selected) ?? null : null,
		    [graph.nodes, selected]
		  );
		  const neighbors = (0, import_react3.useMemo)(() => {
		    if (!node) return [];
		    const ids = /* @__PURE__ */ new Set();
		    for (const e of graph.edges) {
		      if (e.kind !== "wikilink") continue;
		      if (e.source === node.id) ids.add(e.target);
		      if (e.target === node.id) ids.add(e.source);
		    }
		    return [...ids].map((id) => graph.nodes.find((n) => n.id === id)).filter(Boolean);
		  }, [graph, node]);
		  if (!node) return null;
		  const pill = (accent) => ({
		    display: "inline-block",
		    fontSize: 10,
		    padding: "1px 6px",
		    borderRadius: 999,
		    border: `1px solid ${accent ?? "var(--dsw-alias-border-l2, #374151)"}`,
		    color: accent ?? "var(--dsw-alias-label-secondary, #9ca3af)",
		    marginRight: 4
		  });
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		    "div",
		    {
		      style: {
		        height: "100%",
		        overflow: "auto",
		        borderLeft: "1px solid var(--dsw-alias-border-l3, #1f2937)",
		        background: "var(--dsw-alias-bg-layer-1, #0b1220)",
		        padding: 12,
		        color: "var(--dsw-alias-label-primary, #e5e7eb)",
		        fontSize: 12
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 8 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 8, flex: 1 }, children: node.title }),
		          onClose && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		            "button",
		            {
		              type: "button",
		              onClick: onClose,
		              style: {
		                border: 0,
		                background: "transparent",
		                color: "var(--dsw-alias-label-secondary, #9ca3af)",
		                cursor: "pointer",
		                fontSize: 12
		              },
		              children: "\u5173\u95ED"
		            }
		          )
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { marginBottom: 8 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: pill(), children: typeLabel(node.type) }),
		          node.status && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: pill(statusStroke(node.status)), children: node.status }),
		          node.theme && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: pill(), children: node.theme })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		          "div",
		          {
		            style: {
		              color: "var(--dsw-alias-label-tertiary, #6b7280)",
		              wordBreak: "break-all",
		              marginBottom: 10,
		              fontSize: 11
		            },
		            children: node.path
		          }
		        ),
		        node.summary && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { marginBottom: 10, lineHeight: 1.4 }, children: node.summary }),
		        queryHint?.kind === "section1_fight" && queryHint.schemeId === node.id && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		          "div",
		          {
		            style: {
		              marginBottom: 10,
		              padding: 8,
		              borderRadius: 6,
		              background: "#3f1d1d",
		              border: "1px solid #7f1d1d"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "\xA71 \u5B57\u9762 vs Tag" }),
		              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
		                "\xA71\uFF1A",
		                queryHint.section1Status ?? "\u2014",
		                " \xB7 Tag\uFF1A",
		                queryHint.schemeStatus ?? "\u2014"
		              ] }),
		              queryHint.detail && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { color: "#fca5a5", marginTop: 4 }, children: queryHint.detail })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		          "div",
		          {
		            style: {
		              fontSize: 11,
		              fontWeight: 600,
		              color: "var(--dsw-alias-label-secondary, #9ca3af)",
		              marginBottom: 4
		            },
		            children: "\u90BB\u63A5"
		          }
		        ),
		        neighbors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: "\u65E0" }) : neighbors.map((n) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		          "div",
		          {
		            role: onSelectNeighbor ? "button" : void 0,
		            tabIndex: onSelectNeighbor ? 0 : void 0,
		            onClick: () => onSelectNeighbor?.(n.id),
		            onKeyDown: (e) => {
		              if (e.key === "Enter") onSelectNeighbor?.(n.id);
		            },
		            style: {
		              padding: "4px 0",
		              cursor: onSelectNeighbor ? "pointer" : "default",
		              color: "var(--dsw-alias-link, #679efe)"
		            },
		            children: [
		              n.title,
		              " \xB7 ",
		              n.type
		            ]
		          },
		          n.id
		        )),
		        onOpenSource && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		          "button",
		          {
		            type: "button",
		            onClick: () => onOpenSource(node.path),
		            style: {
		              marginTop: 12,
		              padding: "6px 10px",
		              borderRadius: 6,
		              border: "1px solid var(--dsw-alias-border-l2, #374151)",
		              background: "var(--dsw-alias-button-elevated-fill, #1f2937)",
		              color: "var(--dsw-alias-label-primary, #e5e7eb)",
		              cursor: "pointer",
		              fontSize: 12
		            },
		            children: "\u6253\u5F00\u6E90\u6587\u4EF6"
		          }
		        )
		      ]
		    }
		  );
		}

		// src/client/detail/MarkdownPreview.tsx
		var import_react4 = require("react");
		var import_jsx_runtime4 = require("react/jsx-runtime");
		function MarkdownPreview({ filename, text, onClose }) {
		  (0, import_react4.useEffect)(() => {
		    const onKey = (e) => {
		      if (e.key === "Escape") onClose();
		    };
		    window.addEventListener("keydown", onKey);
		    return () => window.removeEventListener("keydown", onKey);
		  }, [onClose]);
		  const html = renderMarkdownLite(text);
		  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		    "div",
		    {
		      role: "presentation",
		      onClick: (e) => {
		        if (e.target === e.currentTarget) onClose();
		      },
		      style: {
		        position: "absolute",
		        inset: 0,
		        zIndex: 20,
		        background: "var(--dsw-alias-bg-mask-1, rgba(0,0,0,0.62))",
		        display: "flex",
		        alignItems: "center",
		        justifyContent: "center",
		        padding: 28
		      },
		      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		        "div",
		        {
		          role: "dialog",
		          "aria-modal": "true",
		          style: {
		            width: "min(680px, 100%)",
		            maxHeight: "86%",
		            overflow: "auto",
		            background: "var(--dsw-alias-bg-layer-2, #232325)",
		            border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))",
		            borderRadius: 10
		          },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		              "div",
		              {
		                style: {
		                  position: "sticky",
		                  top: 0,
		                  display: "flex",
		                  alignItems: "center",
		                  gap: 8,
		                  padding: "12px 14px",
		                  background: "var(--dsw-alias-bg-layer-2, #232325)",
		                  borderBottom: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))",
		                  zIndex: 1
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 13, fontWeight: 600 }, children: filename }),
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                    "span",
		                    {
		                      style: {
		                        fontSize: 10,
		                        padding: "1px 6px",
		                        borderRadius: 999,
		                        background: "var(--dsw-alias-markdown-tag, #2c2c2e)",
		                        color: "var(--dsw-alias-label-secondary, #9ca3af)"
		                      },
		                      children: "\u53EA\u8BFB"
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { flex: 1 } }),
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                    "button",
		                    {
		                      type: "button",
		                      onClick: onClose,
		                      style: {
		                        border: 0,
		                        background: "transparent",
		                        color: "var(--dsw-alias-label-secondary, #9ca3af)",
		                        cursor: "pointer",
		                        fontSize: 12,
		                        padding: "4px 8px",
		                        borderRadius: 6
		                      },
		                      children: "\u5173\u95ED"
		                    }
		                  )
		                ]
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		              "article",
		              {
		                style: {
		                  padding: "18px 22px 28px",
		                  fontSize: 13,
		                  lineHeight: 1.7,
		                  color: "var(--dsw-alias-label-primary, #e5e7eb)"
		                },
		                dangerouslySetInnerHTML: { __html: html }
		              }
		            )
		          ]
		        }
		      )
		    }
		  );
		}
		function escapeHtml(s) {
		  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
		}
		function renderMarkdownLite(src) {
		  let body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
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
		      out.push('<table style="width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 14px">');
		      tableRows.forEach((cells, ri) => {
		        const tag = ri === 0 ? "th" : "td";
		        out.push("<tr>");
		        for (const c2 of cells) {
		          out.push(
		            `<${tag} style="border:1px solid rgba(255,255,255,0.16);padding:6px 8px;text-align:left">${inline(
		              c2
		            )}</${tag}>`
		          );
		        }
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
		        out.push(
		          `<pre style="background:rgba(0,0,0,0.35);padding:10px 12px;border-radius:6px;overflow:auto;font-size:12px"><code>${escapeHtml(
		            codeBuf.join("\n")
		          )}</code></pre>`
		        );
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
		      const cells = line.trim().slice(1, -1).split("|").map((c2) => c2.trim());
		      tableRows.push(cells);
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
		      if (m2) {
		        const level = m2[1].length;
		        const size = level === 1 ? 20 : level === 2 ? 14 : 13;
		        out.push(
		          `<h${level} style="margin:${level === 1 ? "0 0 8px" : "22px 0 8px"};font-size:${size}px;font-weight:650">${inline(
		            m2[2]
		          )}</h${level}>`
		        );
		      }
		      i++;
		      continue;
		    }
		    if (/^>\s?/.test(line)) {
		      closeUl();
		      out.push(
		        `<blockquote style="margin:0 0 12px;padding:8px 12px;border-left:3px solid #679efe;background:rgb(52,65,91)">${inline(
		          line.replace(/^>\s?/, "")
		        )}</blockquote>`
		      );
		      i++;
		      continue;
		    }
		    if (/^[-*]\s+/.test(line)) {
		      if (!inUl) {
		        out.push('<ul style="margin:0 0 12px;padding-left:18px">');
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
		    out.push(`<p style="margin:0 0 10px">${inline(line)}</p>`);
		    i++;
		  }
		  closeUl();
		  flushTable();
		  if (inCode) {
		    out.push(
		      `<pre style="background:rgba(0,0,0,0.35);padding:10px 12px;border-radius:6px;overflow:auto;font-size:12px"><code>${escapeHtml(
		        codeBuf.join("\n")
		      )}</code></pre>`
		    );
		  }
		  return out.join("\n");
		}
		function inline(s) {
		  let t = escapeHtml(s);
		  t = t.replace(/`([^`]+)`/g, '<code style="font-family:ui-monospace,Consolas,monospace;font-size:12px;background:#292929;padding:1px 5px;border-radius:4px">$1</code>');
		  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
		  t = t.replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g, (_m, a2, b) => `<span style="color:#679efe">${b || a2}</span>`);
		  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#679efe">$1</a>');
		  return t;
		}

		// src/client/workspace-memory.ts
		var LS_WORKSPACE_KEY = "dsh.capmapViz.lastWorkspace";
		function readStoredWorkspace() {
		  try {
		    const raw = localStorage.getItem(LS_WORKSPACE_KEY);
		    if (!raw) return null;
		    const parsed = JSON.parse(raw);
		    if (!parsed?.workspaceId || !parsed?.path) return null;
		    return parsed;
		  } catch {
		    return null;
		  }
		}
		function writeStoredWorkspace(ws) {
		  try {
		    localStorage.setItem(LS_WORKSPACE_KEY, JSON.stringify(ws));
		  } catch {
		  }
		}

		// src/client/DocsRootMissingHint.tsx
		var import_react5 = require("react");

		// src/bootstrap/docsRootName.ts
		function defaultDocsRootName(workspaceName, projectRoot) {
		  const fromName = workspaceName?.trim();
		  const fromPath = projectRoot?.replace(/[/\\]+$/, "").split(/[/\\]/).filter(Boolean).pop();
		  const raw = (fromName || fromPath || "project").trim();
		  const safe = raw.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
		  const base = safe || "project";
		  return base.toLowerCase().endsWith("-docs") ? base : `${base}-docs`;
		}

		// src/setupHint.ts
		var DOCS_ROOT_MISSING_CODE = "docs_root_missing";
		var CAPMAP_SKILL_INSTALL_CMD = "npx skills add 1741505640/capmap-skills --skill '*' -y";
		var CAPMAP_INIT_PROMPT = "\u6309 capmap-init \u521D\u59CB\u5316\u6587\u6863\u76EE\u5F55";
		function isDocsRootMissingCode(code) {
		  return code === DOCS_ROOT_MISSING_CODE;
		}
		function isDocsRootMissingMessage(message) {
		  if (!message) return false;
		  return message.includes("\u672A\u627E\u5230 docs_root") || message.includes("docs_root_missing") || /capmap\.parse:\s*未找到 docs_root/.test(message);
		}

		// src/client/DocsRootMissingHint.tsx
		var import_jsx_runtime5 = require("react/jsx-runtime");
		async function copyText(text) {
		  try {
		    await navigator.clipboard.writeText(text);
		    return true;
		  } catch {
		    return false;
		  }
		}
		function CmdRow({ label, cmd }) {
		  const [copied, setCopied] = (0, import_react5.useState)(false);
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginBottom: 12 }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		      "div",
		      {
		        style: {
		          fontSize: 11,
		          color: "var(--dsw-alias-label-secondary, #9ca3af)",
		          marginBottom: 4
		        },
		        children: label
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "stretch" }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		        "code",
		        {
		          style: {
		            flex: 1,
		            display: "block",
		            padding: "8px 10px",
		            borderRadius: 6,
		            border: "1px solid var(--dsw-alias-border-l2, #374151)",
		            background: "var(--dsw-specific-input-major, #1a1a1c)",
		            fontSize: 12,
		            lineHeight: 1.45,
		            whiteSpace: "pre-wrap",
		            wordBreak: "break-all",
		            color: "var(--dsw-alias-label-primary, #e5e7eb)"
		          },
		          children: cmd
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		        "button",
		        {
		          type: "button",
		          onClick: () => {
		            void copyText(cmd).then((ok) => {
		              if (!ok) return;
		              setCopied(true);
		              window.setTimeout(() => setCopied(false), 1500);
		            });
		          },
		          style: {
		            flex: "none",
		            padding: "0 12px",
		            borderRadius: 6,
		            border: "1px solid var(--dsw-alias-border-l2, #374151)",
		            background: "var(--dsw-alias-button-elevated-fill, #1f2937)",
		            color: "var(--dsw-alias-label-primary, #e5e7eb)",
		            cursor: "pointer",
		            fontSize: 12
		          },
		          children: copied ? "\u5DF2\u590D\u5236" : "\u590D\u5236"
		        }
		      )
		    ] })
		  ] });
		}
		function DocsRootMissingHint({
		  projectRoot,
		  workspaceName,
		  onBootstrap
		}) {
		  const suggested = (0, import_react5.useMemo)(
		    () => defaultDocsRootName(workspaceName, projectRoot),
		    [workspaceName, projectRoot]
		  );
		  const [docsRoot, setDocsRoot] = (0, import_react5.useState)(suggested);
		  const [installSkills, setInstallSkills] = (0, import_react5.useState)(true);
		  const [busy, setBusy] = (0, import_react5.useState)(false);
		  const [err, setErr] = (0, import_react5.useState)(null);
		  const [phase, setPhase] = (0, import_react5.useState)(null);
		  const [logs, setLogs] = (0, import_react5.useState)([]);
		  const logRef = (0, import_react5.useRef)(null);
		  (0, import_react5.useEffect)(() => {
		    setDocsRoot(suggested);
		  }, [suggested]);
		  (0, import_react5.useEffect)(() => {
		    const el = logRef.current;
		    if (el) el.scrollTop = el.scrollHeight;
		  }, [logs]);
		  const canBootstrap = Boolean(onBootstrap && projectRoot?.trim());
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		    "div",
		    {
		      style: {
		        flex: 1,
		        overflow: "auto",
		        padding: 24,
		        maxWidth: 640
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { style: { margin: "0 0 8px", fontSize: 15, fontWeight: 600 }, children: "\u672A\u627E\u5230\u6587\u6863\u4F53\u7CFB\uFF08docs_root\uFF09" }),
		        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		          "p",
		          {
		            style: {
		              margin: "0 0 16px",
		              fontSize: 13,
		              lineHeight: 1.55,
		              color: "var(--dsw-alias-label-secondary, #9ca3af)"
		            },
		            children: [
		              "\u672C\u63D2\u4EF6\u4F9D\u8D56 ",
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("b", { style: { color: "var(--dsw-alias-label-primary, #e5e7eb)" }, children: "capmap-skills" }),
		              "\u3002\u5F53\u524D\u5DE5\u4F5C\u533A",
		              projectRoot ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
		                "\uFF08",
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { wordBreak: "break-all" }, children: projectRoot }),
		                "\uFF09"
		              ] }) : null,
		              " ",
		              "\u6CA1\u6709\u53EF\u7528\u7684 ",
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "capmap.yaml" }),
		              " / ",
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: "docs_root" }),
		              "\u3002"
		            ]
		          }
		        ),
		        canBootstrap && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		          "div",
		          {
		            style: {
		              marginBottom: 16,
		              padding: 12,
		              borderRadius: 8,
		              border: "1px solid var(--dsw-alias-border-l2, #374151)",
		              background: "var(--dsw-alias-bg-layer-1, #232325)"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 10 }, children: "\u4E00\u952E\u521D\u59CB\u5316" }),
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		                "label",
		                {
		                  style: {
		                    display: "flex",
		                    alignItems: "center",
		                    gap: 8,
		                    fontSize: 12,
		                    marginBottom: 8
		                  },
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { width: 72, color: "var(--dsw-alias-label-secondary, #9ca3af)" }, children: "docs_root" }),
		                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		                      "input",
		                      {
		                        value: docsRoot,
		                        onChange: (e) => setDocsRoot(e.target.value.trim() || suggested),
		                        disabled: busy,
		                        placeholder: suggested,
		                        style: {
		                          flex: 1,
		                          height: 28,
		                          padding: "0 8px",
		                          borderRadius: 6,
		                          border: "1px solid var(--dsw-alias-border-l2, #374151)",
		                          background: "var(--dsw-specific-input-major, #1a1a1c)",
		                          color: "inherit",
		                          fontSize: 12
		                        }
		                      }
		                    )
		                  ]
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		                "label",
		                {
		                  style: {
		                    display: "flex",
		                    alignItems: "center",
		                    gap: 8,
		                    fontSize: 12,
		                    marginBottom: 12,
		                    cursor: "pointer"
		                  },
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		                      "input",
		                      {
		                        type: "checkbox",
		                        checked: installSkills,
		                        disabled: busy,
		                        onChange: (e) => setInstallSkills(e.target.checked)
		                      }
		                    ),
		                    "\u540C\u65F6\u5B89\u88C5 Skill\uFF08\u540E\u53F0\u4EFB\u52A1\uFF0C\u53EF\u770B\u4E0B\u65B9\u65E5\u5FD7\uFF1B\u7EA6 1\u20133 \u5206\u949F\uFF09"
		                  ]
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		                "button",
		                {
		                  type: "button",
		                  disabled: busy || !docsRoot,
		                  onClick: () => {
		                    if (!onBootstrap) return;
		                    setBusy(true);
		                    setErr(null);
		                    setPhase("\u542F\u52A8\u4EFB\u52A1\u2026");
		                    setLogs([]);
		                    void onBootstrap({ docsRoot, installSkills }, ({ phase: p, logs: ls }) => {
		                      setPhase(p);
		                      setLogs(ls);
		                    }).then(() => {
		                      setPhase("\u5B8C\u6210\uFF0C\u6B63\u5728\u52A0\u8F7D\u56FE\u8C31\u2026");
		                    }).catch((e) => {
		                      setErr(String(e));
		                    }).finally(() => setBusy(false));
		                  },
		                  style: {
		                    height: 32,
		                    padding: "0 14px",
		                    borderRadius: 6,
		                    border: 0,
		                    background: "var(--dsw-alias-button-info-fill, #3b82f6)",
		                    color: "#fff",
		                    cursor: busy ? "wait" : "pointer",
		                    fontSize: 13,
		                    fontWeight: 600,
		                    opacity: busy ? 0.7 : 1
		                  },
		                  children: busy ? "\u8FDB\u884C\u4E2D\u2026" : "\u4E00\u952E\u5B89\u88C5 Skill \u5E76\u521D\u59CB\u5316"
		                }
		              ),
		              (busy || phase || logs.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: 12 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		                  "div",
		                  {
		                    style: {
		                      fontSize: 12,
		                      marginBottom: 6,
		                      color: "var(--dsw-alias-label-primary, #e5e7eb)"
		                    },
		                    children: [
		                      busy ? "\u23F3 " : "",
		                      phase || "\u2026"
		                    ]
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		                  "pre",
		                  {
		                    ref: logRef,
		                    style: {
		                      margin: 0,
		                      maxHeight: 220,
		                      overflow: "auto",
		                      padding: "8px 10px",
		                      borderRadius: 6,
		                      border: "1px solid var(--dsw-alias-border-l2, #374151)",
		                      background: "#0d0d0e",
		                      fontSize: 11,
		                      lineHeight: 1.45,
		                      whiteSpace: "pre-wrap",
		                      wordBreak: "break-all",
		                      color: "var(--dsw-alias-label-secondary, #9ca3af)"
		                    },
		                    children: logs.length ? logs.join("\n") : "\u7B49\u5F85\u65E5\u5FD7\u2026"
		                  }
		                )
		              ] }),
		              err && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: "#fca5a5", whiteSpace: "pre-wrap" }, children: err })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { style: { marginBottom: 8 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		            "summary",
		            {
		              style: {
		                fontSize: 12,
		                color: "var(--dsw-alias-label-secondary, #9ca3af)",
		                cursor: "pointer"
		              },
		              children: "\u624B\u52A8\u547D\u4EE4\uFF08\u5907\u7528\uFF09"
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: 10 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CmdRow, { label: "\u2460 \u5728\u4ED3\u5E93\u6839\u76EE\u5F55\u5B89\u88C5 Skill", cmd: CAPMAP_SKILL_INSTALL_CMD }),
		            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CmdRow, { label: "\u2461 \u5BF9 Agent \u8BF4\uFF08\u89E6\u53D1 capmap-init\uFF09", cmd: CAPMAP_INIT_PROMPT })
		          ] })
		        ] })
		      ]
		    }
		  );
		}

		// src/client/CapMapPanel.tsx
		var import_jsx_runtime6 = require("react/jsx-runtime");
		var selectStyle = {
		  height: 28,
		  padding: "0 8px",
		  borderRadius: 6,
		  border: "1px solid var(--dsw-alias-border-l2, #374151)",
		  background: "var(--dsw-specific-input-major, #232325)",
		  color: "var(--dsw-alias-label-primary, #e5e7eb)",
		  fontSize: 12
		};
		var btnGhost = {
		  height: 28,
		  padding: "0 10px",
		  borderRadius: 6,
		  border: 0,
		  background: "transparent",
		  color: "var(--dsw-alias-label-secondary, #9ca3af)",
		  cursor: "pointer",
		  fontSize: 12
		};
		var btnSec = {
		  height: 28,
		  padding: "0 10px",
		  borderRadius: 6,
		  border: "1px solid var(--dsw-alias-border-l2, #374151)",
		  background: "var(--dsw-alias-button-elevated-fill, #1f2937)",
		  color: "var(--dsw-alias-label-primary, #e5e7eb)",
		  cursor: "pointer",
		  fontSize: 12
		};
		function useWorkspaceItems(props) {
		  const fromHook = props.useWorkspaces?.((s) => s.items);
		  const list = props.workspaces?.list;
		  const fromStore = (0, import_react6.useSyncExternalStore)(
		    (cb) => list ? list.subscribe(cb) : () => {
		    },
		    () => list?.getSnapshot().items ?? [],
		    () => []
		  );
		  return fromHook ?? fromStore;
		}
		function usePanelOpen(controller) {
		  return (0, import_react6.useSyncExternalStore)(
		    (cb) => controller.subscribe(cb),
		    () => controller.isOpen(),
		    () => false
		  );
		}
		function normalizeRpc(res) {
		  if (!res || typeof res !== "object") {
		    return { ok: false, error: { message: "\u7A7A RPC \u54CD\u5E94" } };
		  }
		  const inner = res.value;
		  if (res.ok && inner && typeof inner === "object" && "ok" in inner && (Object.prototype.hasOwnProperty.call(inner, "value") || Object.prototype.hasOwnProperty.call(inner, "error"))) {
		    return inner;
		  }
		  return res;
		}
		function asGraph(value) {
		  if (!value || typeof value !== "object") return null;
		  const g = value;
		  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return null;
		  return {
		    ...g,
		    capabilities: Array.isArray(g.capabilities) ? g.capabilities : [],
		    slices: Array.isArray(g.slices) ? g.slices : [],
		    queries: g.queries ?? {
		      frontier: [],
		      validationGate: [],
		      section1Fight: []
		    }
		  };
		}
		function CapMapPanel({ controller, call, workspaces, useWorkspaces }) {
		  const items = useWorkspaceItems({ controller, call, workspaces, useWorkspaces });
		  const panelOpen = usePanelOpen(controller);
		  const [picking, setPicking] = (0, import_react6.useState)(true);
		  const [workspace, setWorkspace] = (0, import_react6.useState)(null);
		  const [loading, setLoading] = (0, import_react6.useState)(false);
		  const [error, setError] = (0, import_react6.useState)(null);
		  const [errorCode, setErrorCode] = (0, import_react6.useState)(null);
		  const [graph, setGraph] = (0, import_react6.useState)(null);
		  const [selected, setSelected] = (0, import_react6.useState)(null);
		  const [queryHint, setQueryHint] = (0, import_react6.useState)(null);
		  const [advancedRoot, setAdvancedRoot] = (0, import_react6.useState)("");
		  const [showAdvanced, setShowAdvanced] = (0, import_react6.useState)(false);
		  const [showFilters, setShowFilters] = (0, import_react6.useState)(false);
		  const [showMore, setShowMore] = (0, import_react6.useState)(false);
		  const [themeFilter, setThemeFilter] = (0, import_react6.useState)("\u5168\u90E8");
		  const [typeFilter, setTypeFilter] = (0, import_react6.useState)("\u5168\u90E8");
		  const [statusFilter, setStatusFilter] = (0, import_react6.useState)("\u5168\u90E8");
		  const [search, setSearch] = (0, import_react6.useState)("");
		  const [clusterThemes, setClusterThemes] = (0, import_react6.useState)(true);
		  const [watchRoot, setWatchRoot] = (0, import_react6.useState)(null);
		  const [revision, setRevision] = (0, import_react6.useState)(0);
		  const [leftDrawer, setLeftDrawer] = (0, import_react6.useState)(null);
		  const [wide, setWide] = (0, import_react6.useState)(true);
		  const [preview, setPreview] = (0, import_react6.useState)(null);
		  const [previewErr, setPreviewErr] = (0, import_react6.useState)(null);
		  const graphCanvasRef = (0, import_react6.useRef)(null);
		  const shellRef = (0, import_react6.useRef)(null);
		  const deeplinkDone = (0, import_react6.useRef)(false);
		  const deeplinkFocused = (0, import_react6.useRef)(false);
		  const revisionRef = (0, import_react6.useRef)(0);
		  const restoredRef = (0, import_react6.useRef)(false);
		  (0, import_react6.useEffect)(() => {
		    const el = shellRef.current;
		    if (!el) return;
		    const ro = new ResizeObserver(() => {
		      setWide(el.clientWidth >= 900);
		    });
		    ro.observe(el);
		    setWide(el.clientWidth >= 900);
		    return () => ro.disconnect();
		  }, [picking]);
		  const applyDeeplink = (0, import_react6.useCallback)((g) => {
		    if (deeplinkDone.current) return;
		    try {
		      const node = new URLSearchParams(window.location.search).get("node");
		      if (!node) return;
		      const stem = node.replace(/\.md$/i, "");
		      const hit = g.nodes.find(
		        (n) => n.id === stem || n.id === node || n.path.endsWith(`/${stem}.md`) || n.path.endsWith(`\\${stem}.md`)
		      );
		      if (hit) {
		        setSelected(hit.id);
		        deeplinkDone.current = true;
		        deeplinkFocused.current = false;
		      }
		    } catch {
		    }
		  }, []);
		  const loadRoot = (0, import_react6.useCallback)(
		    async (root, ws) => {
		      if (!root.trim()) return;
		      setLoading(true);
		      setError(null);
		      setErrorCode(null);
		      setPicking(false);
		      setWorkspace(ws);
		      try {
		        const res = normalizeRpc(await call("parse", { root: root.trim() }));
		        if (res.ok) {
		          const g = asGraph(res.value);
		          if (!g) {
		            setGraph(null);
		            setError("\u89E3\u6790\u7ED3\u679C\u7F3A\u5C11 nodes/edges");
		            return;
		          }
		          setGraph(g);
		          setSelected(null);
		          setQueryHint(null);
		          setThemeFilter("\u5168\u90E8");
		          setTypeFilter("\u5168\u90E8");
		          setStatusFilter("\u5168\u90E8");
		          setSearch("");
		          setWatchRoot(root.trim());
		          setPreview(null);
		          deeplinkDone.current = false;
		          deeplinkFocused.current = false;
		          applyDeeplink(g);
		          if (ws) {
		            writeStoredWorkspace({
		              workspaceId: ws.workspaceId,
		              path: ws.path,
		              title: ws.title
		            });
		          }
		          try {
		            const wr = normalizeRpc(await call("watch", { root: root.trim(), action: "start" }));
		            if (wr.ok) {
		              const v = wr.value;
		              revisionRef.current = v.revision ?? 1;
		              setRevision(revisionRef.current);
		            }
		          } catch {
		          }
		        } else {
		          setGraph(null);
		          setError(res.error?.message ?? "\u89E3\u6790\u5931\u8D25");
		          setErrorCode(res.error?.code ?? null);
		        }
		      } catch (err) {
		        setGraph(null);
		        setError(String(err));
		        setErrorCode(null);
		      } finally {
		        setLoading(false);
		      }
		    },
		    [call, applyDeeplink]
		  );
		  const pickWorkspace = (0, import_react6.useCallback)(
		    (ws) => {
		      const root = (ws.path ?? "").trim();
		      if (!root) {
		        setError("\u8BE5\u5DE5\u4F5C\u533A\u6CA1\u6709\u53EF\u7528\u8DEF\u5F84");
		        setPicking(false);
		        return;
		      }
		      void loadRoot(root, ws);
		    },
		    [loadRoot]
		  );
		  const runBootstrap = (0, import_react6.useCallback)(
		    async (opts, onProgress) => {
		      const root = (watchRoot || workspace?.path || advancedRoot || "").trim();
		      if (!root) throw new Error("\u6CA1\u6709\u53EF\u7528\u7684\u5DE5\u4F5C\u533A\u8DEF\u5F84");
		      const startRes = normalizeRpc(
		        await call("bootstrap", {
		          root,
		          docsRoot: opts.docsRoot,
		          installSkills: opts.installSkills
		        })
		      );
		      if (!startRes.ok) {
		        throw new Error(startRes.error?.message ?? "\u65E0\u6CD5\u542F\u52A8\u521D\u59CB\u5316\u4EFB\u52A1");
		      }
		      const jobId = startRes.value?.jobId;
		      if (!jobId) throw new Error("\u672A\u8FD4\u56DE jobId");
		      const sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
		      for (; ; ) {
		        await sleep2(800);
		        const stRes = normalizeRpc(await call("bootstrapStatus", { jobId }));
		        if (!stRes.ok) {
		          throw new Error(stRes.error?.message ?? "\u67E5\u8BE2\u8FDB\u5EA6\u5931\u8D25");
		        }
		        const snap = stRes.value;
		        onProgress?.({ phase: snap.phase, logs: snap.logs ?? [] });
		        if (snap.state === "running") continue;
		        if (snap.state === "error") {
		          try {
		            await loadRoot(root, workspace);
		          } catch {
		          }
		          throw new Error(snap.error || snap.result?.skills?.detail || "\u521D\u59CB\u5316\u5931\u8D25");
		        }
		        if (opts.installSkills && snap.result?.skills?.ok === false) {
		          try {
		            await loadRoot(root, workspace);
		          } catch {
		          }
		          throw new Error(snap.result.skills.detail ?? "Skill \u672A\u5B89\u88C5\u6210\u529F");
		        }
		        await loadRoot(root, workspace);
		        return;
		      }
		    },
		    [advancedRoot, call, loadRoot, watchRoot, workspace]
		  );
		  (0, import_react6.useEffect)(() => {
		    if (!panelOpen || graph || !picking || restoredRef.current) return;
		    restoredRef.current = true;
		    const stored = readStoredWorkspace();
		    if (!stored) return;
		    const match = items.find(
		      (ws) => ws.workspaceId === stored.workspaceId || ws.path === stored.path
		    );
		    if (match) {
		      void loadRoot(match.path, match);
		      return;
		    }
		    if (stored.path) {
		      void loadRoot(stored.path, {
		        workspaceId: stored.workspaceId,
		        path: stored.path,
		        title: stored.title || stored.path
		      });
		    }
		  }, [panelOpen, graph, picking, items, loadRoot]);
		  const themeOptions = (0, import_react6.useMemo)(() => {
		    const s = /* @__PURE__ */ new Set();
		    for (const n of graph?.nodes ?? []) if (n.theme) s.add(n.theme);
		    return ["\u5168\u90E8", ...[...s].sort()];
		  }, [graph]);
		  const statusOptions = (0, import_react6.useMemo)(() => {
		    const s = /* @__PURE__ */ new Set();
		    for (const n of graph?.nodes ?? []) if (n.status) s.add(n.status);
		    return ["\u5168\u90E8", ...[...s].sort()];
		  }, [graph]);
		  const visibleGraph = (0, import_react6.useMemo)(() => {
		    if (!graph) return null;
		    const q = search.trim().toLowerCase();
		    const nodes = graph.nodes.filter((n) => {
		      if (themeFilter !== "\u5168\u90E8" && n.theme !== themeFilter) return false;
		      if (typeFilter !== "\u5168\u90E8" && n.type !== typeFilter) return false;
		      if (statusFilter !== "\u5168\u90E8" && n.status !== statusFilter) return false;
		      if (q && !n.id.toLowerCase().includes(q) && !n.title.toLowerCase().includes(q) && !n.path.toLowerCase().includes(q)) {
		        return false;
		      }
		      return true;
		    });
		    const ids = new Set(nodes.map((n) => n.id));
		    const edges = graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
		    return { ...graph, nodes, edges };
		  }, [graph, themeFilter, typeFilter, statusFilter, search]);
		  const onSelectNode = (0, import_react6.useCallback)((id) => {
		    setSelected(id);
		    setQueryHint(null);
		  }, []);
		  const onSelectQuery = (0, import_react6.useCallback)((row) => {
		    setQueryHint(row);
		    if (row.schemeId) setSelected(row.schemeId);
		  }, []);
		  const toggleLeft = (mode) => {
		    if (wide) {
		      setLeftDrawer((cur) => {
		        if (cur === mode) return null;
		        if (cur === null) return mode;
		        return mode;
		      });
		      return;
		    }
		    setLeftDrawer((cur) => cur === mode ? null : mode);
		  };
		  const openPreview = (0, import_react6.useCallback)(
		    async (relPath) => {
		      if (!watchRoot) return;
		      setPreviewErr(null);
		      try {
		        const res = normalizeRpc(await call("read", { root: watchRoot, path: relPath }));
		        if (!res.ok) {
		          setPreviewErr(res.error?.message ?? "\u8BFB\u53D6\u5931\u8D25");
		          return;
		        }
		        const v = res.value;
		        setPreview({ path: v.path ?? relPath, text: v.text ?? "" });
		      } catch (err) {
		        setPreviewErr(String(err));
		      }
		    },
		    [call, watchRoot]
		  );
		  (0, import_react6.useEffect)(() => {
		    if (!deeplinkDone.current || deeplinkFocused.current || !selected || picking || !panelOpen) return;
		    const t = window.setTimeout(() => {
		      graphCanvasRef.current?.focusNode(selected);
		      deeplinkFocused.current = true;
		    }, 700);
		    return () => window.clearTimeout(t);
		  }, [graph, selected, picking, panelOpen]);
		  (0, import_react6.useEffect)(() => {
		    if (!panelOpen || picking || !watchRoot) return;
		    let cancelled = false;
		    const tick = async () => {
		      try {
		        const res = normalizeRpc(await call("revision", { root: watchRoot }));
		        if (cancelled || !res.ok) return;
		        const next = res.value.revision ?? 0;
		        if (next > 0 && next !== revisionRef.current) {
		          revisionRef.current = next;
		          setRevision(next);
		          const parsed = normalizeRpc(await call("parse", { root: watchRoot }));
		          if (parsed.ok && !cancelled) {
		            const g = asGraph(parsed.value);
		            if (g) setGraph(g);
		          }
		        }
		      } catch {
		      }
		    };
		    const id = window.setInterval(() => {
		      void tick();
		    }, 1500);
		    return () => {
		      cancelled = true;
		      window.clearInterval(id);
		    };
		  }, [panelOpen, picking, watchRoot, call]);
		  (0, import_react6.useEffect)(() => {
		    if (panelOpen && !picking) return;
		    if (!watchRoot) return;
		    void call("watch", { root: watchRoot, action: "stop" });
		  }, [panelOpen, picking, watchRoot, call]);
		  const startChangeWorkspace = () => {
		    restoredRef.current = true;
		    setPicking(true);
		    setGraph(null);
		    setError(null);
		    setErrorCode(null);
		    setWatchRoot(null);
		    setPreview(null);
		    setLeftDrawer(null);
		  };
		  void revision;
		  const docsRootMissing = isDocsRootMissingCode(errorCode) || isDocsRootMissingMessage(error);
		  const projectRootHint = watchRoot || workspace?.path || advancedRoot || null;
		  const showDetail = Boolean(selected && graph);
		  (0, import_react6.useEffect)(() => {
		    if (!wide && showDetail && leftDrawer) setLeftDrawer(null);
		  }, [wide, showDetail]);
		  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		    "div",
		    {
		      ref: shellRef,
		      style: {
		        position: "absolute",
		        inset: 0,
		        display: "flex",
		        flexDirection: "column",
		        background: "var(--dsw-alias-bg-base, #151517)",
		        color: "var(--dsw-alias-label-primary, #e5e7eb)"
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		          "div",
		          {
		            style: {
		              height: 40,
		              flex: "none",
		              display: "flex",
		              gap: 8,
		              padding: "0 10px",
		              alignItems: "center",
		              borderBottom: "1px solid var(--dsw-alias-border-l2, #1f2937)",
		              background: "var(--dsw-alias-bg-layer-1, #232325)"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontWeight: 600, fontSize: 13 }, children: "\u80FD\u529B\u5E95\u56FE" }),
		              !picking && workspace && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                "button",
		                {
		                  type: "button",
		                  title: workspace.path,
		                  onClick: startChangeWorkspace,
		                  style: {
		                    maxWidth: 148,
		                    height: 24,
		                    padding: "0 8px",
		                    border: "1px solid var(--dsw-alias-border-l2, #374151)",
		                    borderRadius: 6,
		                    background: "var(--dsw-specific-input-major, #232325)",
		                    color: "var(--dsw-alias-label-primary, #e5e7eb)",
		                    fontSize: 11,
		                    overflow: "hidden",
		                    textOverflow: "ellipsis",
		                    whiteSpace: "nowrap",
		                    cursor: "pointer"
		                  },
		                  children: workspace.title
		                }
		              ),
		              !picking && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                "input",
		                {
		                  value: search,
		                  onChange: (e) => setSearch(e.target.value),
		                  placeholder: "\u641C\u7D22\u6807\u9898 / \u6587\u4EF6\u540D",
		                  style: { ...selectStyle, width: 168 }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { flex: 1, minWidth: 8 } }),
		              !picking && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                  "button",
		                  {
		                    type: "button",
		                    style: { ...btnSec, ...showFilters ? { background: "var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))" } : {} },
		                    onClick: () => setShowFilters((v) => !v),
		                    children: "\u7B5B\u9009"
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", style: btnGhost, onClick: () => setShowMore((v) => !v), children: "\u66F4\u591A" })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: () => controller.closePanel(), style: btnGhost, children: "\u5173\u95ED" })
		            ]
		          }
		        ),
		        !picking && showFilters && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		          "div",
		          {
		            style: {
		              display: "flex",
		              gap: 8,
		              alignItems: "center",
		              padding: "6px 10px",
		              borderBottom: "1px solid var(--dsw-alias-border-l2, #1f2937)",
		              background: "var(--dsw-alias-bg-layer-1, #232325)"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("select", { value: themeFilter, onChange: (e) => setThemeFilter(e.target.value), style: selectStyle, children: themeOptions.map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("option", { value: t, children: [
		                "\u4E3B\u9898:",
		                t
		              ] }, t)) }),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), style: selectStyle, children: TYPE_FILTER_OPTIONS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("option", { value: t.value, children: [
		                "\u7C7B\u578B:",
		                t.label
		              ] }, t.value)) }),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), style: selectStyle, children: statusOptions.map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("option", { value: t, children: [
		                "\u72B6\u6001:",
		                t
		              ] }, t)) })
		            ]
		          }
		        ),
		        !picking && showMore && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		          "div",
		          {
		            style: {
		              position: "absolute",
		              top: 44,
		              right: 48,
		              zIndex: 15,
		              minWidth: 160,
		              padding: 6,
		              background: "var(--dsw-specific-menu, #353638)",
		              border: "1px solid var(--dsw-alias-border-l2, #374151)",
		              borderRadius: 8
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                MoreItem,
		                {
		                  label: clusterThemes ? "\u5206\u7C07\uFF1A\u5F00" : "\u5206\u7C07\uFF1A\u5173",
		                  onClick: () => setClusterThemes((v) => !v)
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                MoreItem,
		                {
		                  label: "\u5BFC\u51FA PNG",
		                  onClick: () => {
		                    graphCanvasRef.current?.exportPng("capmap-graph.png");
		                    setShowMore(false);
		                  }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                MoreItem,
		                {
		                  label: "\u66F4\u6362\u5DE5\u4F5C\u533A",
		                  onClick: () => {
		                    startChangeWorkspace();
		                    setShowMore(false);
		                  }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                MoreItem,
		                {
		                  label: showAdvanced ? "\u6536\u8D77\u9AD8\u7EA7" : "\u9AD8\u7EA7\uFF1A\u624B\u8F93\u8DEF\u5F84",
		                  onClick: () => setShowAdvanced((v) => !v)
		                }
		              )
		            ]
		          }
		        ),
		        picking ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1, overflow: "auto", padding: 20 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { style: { margin: "0 0 6px", fontSize: 14, fontWeight: 600 }, children: "\u9009\u62E9\u5DE5\u4F5C\u533A" }),
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { margin: "0 0 16px", fontSize: 12, color: "var(--dsw-alias-label-secondary, #9ca3af)" }, children: "\u6253\u5F00\u80FD\u529B\u5E95\u56FE\u3002\u4E0A\u6B21\u4F7F\u7528\u7684\u5DE5\u4F5C\u533A\u4F1A\u81EA\u52A8\u6062\u590D\u3002" }),
		          items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, color: "#fbbf24" }, children: "\u6682\u65E0\u5DE5\u4F5C\u533A\u3002\u8BF7\u5148\u5728\u4FA7\u680F\u300C\u6DFB\u52A0\u5DE5\u4F5C\u533A\u300D\u3002" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }, children: items.map((ws) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		            "button",
		            {
		              type: "button",
		              onClick: () => pickWorkspace(ws),
		              disabled: loading,
		              style: {
		                display: "block",
		                width: "100%",
		                textAlign: "left",
		                padding: "12px 14px",
		                border: "1px solid var(--dsw-alias-border-l2, #374151)",
		                borderRadius: 8,
		                background: "var(--dsw-alias-bg-layer-1, #232325)",
		                color: "inherit",
		                cursor: "pointer"
		              },
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("b", { style: { display: "block", fontSize: 13 }, children: ws.title || ws.path }),
		                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                  "span",
		                  {
		                    style: {
		                      display: "block",
		                      marginTop: 4,
		                      fontSize: 11,
		                      color: "var(--dsw-alias-label-secondary, #9ca3af)",
		                      wordBreak: "break-all"
		                    },
		                    children: ws.path
		                  }
		                )
		              ]
		            },
		            ws.workspaceId
		          )) }),
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { marginTop: 16 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: () => setShowAdvanced((v) => !v), style: btnSec, children: showAdvanced ? "\u6536\u8D77\u9AD8\u7EA7" : "\u9AD8\u7EA7\uFF1A\u624B\u8F93\u8DEF\u5F84" }) }),
		          showAdvanced && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, marginTop: 12, maxWidth: 560, alignItems: "center" }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "input",
		              {
		                value: advancedRoot,
		                onChange: (e) => setAdvancedRoot(e.target.value),
		                onKeyDown: (e) => e.key === "Enter" && void loadRoot(advancedRoot, null),
		                placeholder: "\u9003\u751F\u8231\uFF1A\u624B\u8F93\u9879\u76EE\u6839\u7EDD\u5BF9\u8DEF\u5F84",
		                style: { ...selectStyle, flex: 1 }
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "button",
		              {
		                type: "button",
		                onClick: () => void loadRoot(advancedRoot, null),
		                disabled: loading || !advancedRoot.trim(),
		                style: btnSec,
		                children: loading ? "\u52A0\u8F7D\u4E2D\u2026" : "\u52A0\u8F7D"
		              }
		            )
		          ] }),
		          error && (docsRootMissing ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { marginTop: 16 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		            DocsRootMissingHint,
		            {
		              projectRoot: projectRootHint,
		              workspaceName: workspace?.title,
		              onBootstrap: runBootstrap
		            }
		          ) }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { marginTop: 12, color: "#fca5a5", fontSize: 13 }, children: error }))
		        ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
		          showAdvanced && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, padding: "8px 10px", alignItems: "center" }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "input",
		              {
		                value: advancedRoot,
		                onChange: (e) => setAdvancedRoot(e.target.value),
		                onKeyDown: (e) => e.key === "Enter" && void loadRoot(advancedRoot, null),
		                placeholder: "\u9003\u751F\u8231\uFF1A\u624B\u8F93\u9879\u76EE\u6839\u7EDD\u5BF9\u8DEF\u5F84",
		                style: { ...selectStyle, flex: 1 }
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "button",
		              {
		                type: "button",
		                onClick: () => void loadRoot(advancedRoot, null),
		                disabled: loading || !advancedRoot.trim(),
		                style: btnSec,
		                children: loading ? "\u52A0\u8F7D\u4E2D\u2026" : "\u52A0\u8F7D"
		              }
		            )
		          ] }),
		          error && !docsRootMissing && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { padding: "8px 16px", color: "#fca5a5", fontSize: 13 }, children: error }),
		          previewErr && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { padding: "8px 16px", color: "#fca5a5", fontSize: 13 }, children: previewErr }),
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { flex: 1, minHeight: 0, display: "flex", position: "relative" }, children: loading && !graph ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { flex: 1, padding: 40, color: "var(--dsw-alias-label-secondary, #9ca3af)" }, children: "\u6B63\u5728\u89E3\u6790\u80FD\u529B\u5E95\u56FE\u2026" }) : docsRootMissing && !graph ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		            DocsRootMissingHint,
		            {
		              projectRoot: projectRootHint,
		              workspaceName: workspace?.title,
		              onBootstrap: runBootstrap
		            }
		          ) : graph && visibleGraph ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		              "div",
		              {
		                style: {
		                  width: 36,
		                  flex: "none",
		                  borderRight: "1px solid var(--dsw-alias-border-l2, #1f2937)",
		                  background: "var(--dsw-alias-bg-layer-1, #232325)",
		                  display: "flex",
		                  flexDirection: "column",
		                  alignItems: "center",
		                  paddingTop: 8,
		                  gap: 6
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    RailBtn,
		                    {
		                      label: "\u770B",
		                      title: "\u6D3B\u770B\u677F",
		                      on: leftDrawer === "board",
		                      onClick: () => toggleLeft("board")
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    RailBtn,
		                    {
		                      label: "\u6811",
		                      title: "\u76EE\u5F55",
		                      on: leftDrawer === "tree",
		                      onClick: () => toggleLeft("tree")
		                    }
		                  )
		                ]
		              }
		            ),
		            leftDrawer === "board" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { width: 240, flex: "none", minHeight: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              LiveBoard,
		              {
		                graph,
		                themeFilter,
		                selected,
		                onSelectQuery
		              }
		            ) }),
		            leftDrawer === "tree" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { width: 268, flex: "none", minHeight: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              ThemeTreePanel,
		              {
		                graph,
		                themeFilter,
		                statusFilter,
		                selected,
		                onSelect: onSelectNode,
		                onStatusFilter: setStatusFilter
		              }
		            ) }),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { flex: 1, minWidth: 0, minHeight: 0, position: "relative" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              GraphCanvas,
		              {
		                ref: graphCanvasRef,
		                graph: visibleGraph,
		                selected,
		                onSelect: onSelectNode,
		                clusterThemes
		              }
		            ) }),
		            showDetail && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { width: 260, flex: "none", minHeight: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              NodeDetail,
		              {
		                graph,
		                selected,
		                queryHint,
		                onClose: () => onSelectNode(null),
		                onSelectNeighbor: onSelectNode,
		                onOpenSource: (p) => void openPreview(p)
		              }
		            ) }),
		            preview && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              MarkdownPreview,
		              {
		                filename: preview.path.split("/").pop() ?? preview.path,
		                text: preview.text,
		                onClose: () => setPreview(null)
		              }
		            )
		          ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { flex: 1, padding: 40, color: "var(--dsw-alias-label-tertiary, #6b7280)" }, children: "\u9009\u62E9\u5DE5\u4F5C\u533A\u540E\u52A0\u8F7D\u56FE\u8C31\u3002" }) })
		        ] })
		      ]
		    }
		  );
		}
		function RailBtn({
		  label,
		  title,
		  on,
		  onClick
		}) {
		  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		    "button",
		    {
		      type: "button",
		      title,
		      onClick,
		      style: {
		        width: 28,
		        height: 28,
		        borderRadius: 6,
		        border: "1px solid var(--dsw-alias-border-l2, #374151)",
		        background: on ? "var(--dsw-specific-sidebar-nav-item-active, #43454a)" : "var(--dsw-alias-button-elevated-fill, #1f2937)",
		        color: on ? "var(--dsw-alias-label-primary, #e5e7eb)" : "var(--dsw-alias-label-secondary, #9ca3af)",
		        fontSize: 11,
		        cursor: "pointer"
		      },
		      children: label
		    }
		  );
		}
		function MoreItem({ label, onClick }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		    "button",
		    {
		      type: "button",
		      onClick,
		      style: {
		        display: "block",
		        width: "100%",
		        textAlign: "left",
		        border: 0,
		        background: "transparent",
		        color: "var(--dsw-alias-label-primary, #e5e7eb)",
		        padding: "7px 8px",
		        borderRadius: 6,
		        fontSize: 12,
		        cursor: "pointer"
		      },
		      children: label
		    }
		  );
		}

		// src/client/panel-mount-core.ts
		var import_client = require("react-dom/client");
		var CONVERSATION_COLUMN_SELECTOR = '[data-pane="conversation"], [class*="centerCol"]';
		var ACTIVATE_EVENT = "dsh-panel-activate";
		var SIDEBAR_ROW_SELECTOR = '[class*="sessionRow"], [class*="projectRow"], [class*="searchResultRow"], [class*="searchResultWorkspace"], [class*="newSession"]';
		function conversationColumn() {
		  return document.querySelector(CONVERSATION_COLUMN_SELECTOR) ?? void 0;
		}
		function mountCenterPanel(options) {
		  let root;
		  let container;
		  const siblingNames = new Set(options.siblings.map((s) => s.panelName));
		  const ensure = () => {
		    if (container !== void 0) {
		      if (container.isConnected) return;
		      root?.unmount();
		      root = void 0;
		      container.remove();
		      container = void 0;
		    }
		    const column = conversationColumn();
		    if (column === void 0) return;
		    container = document.createElement("div");
		    container.dataset[options.viewDatasetKey] = "";
		    container.dataset.dshPlugin = options.pluginName;
		    if (options.viewClassName) container.className = options.viewClassName;
		    column.appendChild(container);
		    root = (0, import_client.createRoot)(container);
		    options.render(root);
		  };
		  const waitObserver = new MutationObserver(() => {
		    ensure();
		  });
		  waitObserver.observe(document.body, { childList: true, subtree: true });
		  const applyActive = () => {
		    if (options.isOpen()) {
		      for (const sibling of options.siblings) {
		        document.documentElement.removeAttribute(sibling.activeAttribute);
		      }
		      document.documentElement.setAttribute(options.activeAttribute, "");
		      document.dispatchEvent(new CustomEvent(ACTIVATE_EVENT, { detail: options.panelName }));
		    } else {
		      document.documentElement.removeAttribute(options.activeAttribute);
		    }
		  };
		  const onOtherActivate = (event) => {
		    const detail = event.detail;
		    if (siblingNames.has(detail) && options.isOpen()) {
		      options.close();
		    }
		  };
		  const onClickSidebarRow = (event) => {
		    if (!options.isOpen()) return;
		    const target = event.target;
		    if (target === null) return;
		    if (target.closest(SIDEBAR_ROW_SELECTOR) !== null) options.close();
		  };
		  document.addEventListener("click", onClickSidebarRow, true);
		  document.addEventListener(ACTIVATE_EVENT, onOtherActivate);
		  const unsubscribe = options.subscribe(applyActive);
		  applyActive();
		  ensure();
		  return () => {
		    document.removeEventListener("click", onClickSidebarRow, true);
		    document.removeEventListener(ACTIVATE_EVENT, onOtherActivate);
		    waitObserver.disconnect();
		    unsubscribe();
		    document.documentElement.removeAttribute(options.activeAttribute);
		    root?.unmount();
		    root = void 0;
		    container?.remove();
		    container = void 0;
		  };
		}

		// src/client/panel-mount.tsx
		function mountPanel(controller, panelProps) {
		  return mountCenterPanel({
		    render: (root) => {
		      root.render((0, import_react7.createElement)(CapMapPanel, { ...panelProps, controller }));
		    },
		    viewDatasetKey: "dshCapmapView",
		    pluginName: "capmap-viz",
		    activeAttribute: "data-dsh-capmap-active",
		    siblings: [
		      { activeAttribute: "data-dsh-taskboard-active", panelName: "taskboard" },
		      { activeAttribute: "data-dsh-ssh-active", panelName: "ssh" }
		    ],
		    panelName: "capmap",
		    isOpen: () => controller.isOpen(),
		    close: () => controller.closePanel(),
		    subscribe: (listener) => controller.subscribe(listener)
		  });
		}

		// src/client/sidebar-entry-core.ts
		function sidebarRoot() {
		  const column = document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');
		  if (column === null) return void 0;
		  const logoOwner = column.querySelector('[class*="logoRow"]')?.parentElement;
		  return logoOwner ?? column.firstElementChild;
		}
		function newSessionButton(root) {
		  const nested = root.querySelector('button[class*="newSession"]');
		  if (nested !== null) return nested;
		  for (const child of root.children) {
		    if (child.tagName === "BUTTON") return child;
		  }
		  return void 0;
		}
		function createEntry(options) {
		  const entry = document.createElement("button");
		  entry.type = "button";
		  entry.setAttribute(options.rowAttribute, "");
		  if (options.plugin !== void 0) {
		    entry.setAttribute("data-dsh-plugin", options.plugin);
		    entry.setAttribute("data-dsh-part", "sidebar-entry");
		  }
		  entry.className = options.css["entry"] ?? "";
		  const labelSpan = document.createElement("span");
		  labelSpan.className = options.css["entryLabel"] ?? "";
		  const iconSpan = document.createElement("span");
		  iconSpan.className = options.css["entryIcon"] ?? "";
		  iconSpan.innerHTML = options.icon;
		  entry.append(iconSpan, labelSpan);
		  const applyLabel = () => {
		    entry.setAttribute("aria-label", options.label());
		    if (options.tooltip !== void 0) entry.setAttribute("title", options.tooltip());
		    labelSpan.textContent = options.label();
		  };
		  applyLabel();
		  entry.addEventListener("click", options.onToggle);
		  return { entry, applyLabel };
		}
		function placeEntry(root, entry, options) {
		  const button = newSessionButton(root);
		  if (button === void 0) return false;
		  if (entry.parentElement !== root) {
		    const row = button.closest('[class*="logoRow"]');
		    const base = row !== null && row.parentElement === root ? row : button;
		    const family = Array.from(root.children).filter(
		      (el) => el instanceof HTMLElement && el.matches(options.familySelectors.join(", "))
		    );
		    const anchor = options.position === "before" ? family.length > 0 ? family[0] : base.nextElementSibling : family.length > 0 ? family[family.length - 1].nextElementSibling : base.nextElementSibling;
		    root.insertBefore(entry, anchor);
		  }
		  return true;
		}
		function mountSidebarEntry(options) {
		  if (typeof document !== "undefined" && document.querySelector(options.rowSelector) !== null) {
		    return () => {
		    };
		  }
		  const { entry, applyLabel } = createEntry(options);
		  let root;
		  let placed = false;
		  let unsubscribeRefresh;
		  if (options.refresh !== void 0) {
		    try {
		      unsubscribeRefresh = options.refresh.subscribe(applyLabel);
		    } catch {
		    }
		  }
		  const tryPlace = () => {
		    if (root !== void 0 && !root.isConnected) {
		      rootObserver.disconnect();
		      root = void 0;
		      placed = false;
		    }
		    if (placed) {
		      if (document.body.contains(entry)) return;
		      rootObserver.disconnect();
		      root = void 0;
		      placed = false;
		    }
		    root ??= sidebarRoot();
		    if (root === void 0) return;
		    placed = placeEntry(root, entry, options);
		    if (placed) {
		      rootObserver.observe(root, { childList: true, subtree: true });
		    }
		  };
		  const waitObserver = new MutationObserver(() => {
		    tryPlace();
		  });
		  waitObserver.observe(document.body, { childList: true, subtree: true });
		  const rootObserver = new MutationObserver(() => {
		    if (root === void 0 || !root.isConnected) {
		      placed = false;
		      tryPlace();
		      return;
		    }
		    if (!root.contains(entry)) {
		      placed = placeEntry(root, entry, options);
		    }
		  });
		  const unsubscribeActive = options.active === void 0 ? void 0 : (() => {
		    const syncActive = () => {
		      if (options.active.isOpen()) entry.dataset.active = "true";
		      else delete entry.dataset.active;
		    };
		    const unsubscribe = options.active.subscribe(syncActive);
		    syncActive();
		    return unsubscribe;
		  })();
		  tryPlace();
		  return () => {
		    waitObserver.disconnect();
		    rootObserver.disconnect();
		    unsubscribeRefresh?.();
		    unsubscribeActive?.();
		    entry.remove();
		  };
		}

		// src/client/styles.ts
		var STYLE_ID = "dsh-capmap-viz-shell-css";
		var CSS = `
		[data-pane='conversation'],
		[class*='centerCol'] {
		  position: relative;
		}

		[data-dsh-capmap-view] {
		  position: absolute;
		  inset: 0;
		  display: none;
		  z-index: 60;
		  background: var(--dsw-alias-bg-base, #0b1220);
		  color: var(--dsw-alias-text-primary, #e5e7eb);
		}

		html[data-dsh-capmap-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [data-dsh-capmap-view] {
		  display: block;
		}

		html[data-dsh-capmap-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [data-pane='conversation'] > :not([data-dsh-capmap-view]),
		html[data-dsh-capmap-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [class*='centerCol'] > :not([data-dsh-capmap-view]) {
		  display: none !important;
		}

		.dsh-capmap-entry {
		  box-sizing: border-box;
		  display: flex;
		  align-items: center;
		  gap: 8px;
		  width: 100%;
		  height: 36px;
		  padding: 0 10px;
		  background: transparent;
		  border: none;
		  border-radius: 8px;
		  color: var(--dsw-alias-label-secondary, #9ca3af);
		  cursor: pointer;
		  font-size: 13px;
		  white-space: nowrap;
		}

		.dsh-capmap-entry:hover {
		  background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.06));
		  color: var(--dsw-alias-label-primary, #e5e7eb);
		}

		.dsh-capmap-entry[data-active] {
		  background: var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.1));
		  color: var(--dsw-alias-label-primary, #e5e7eb);
		  font-weight: 600;
		}

		.dsh-capmap-entryIcon {
		  display: inline-flex;
		  align-items: center;
		  justify-content: center;
		  width: 24px;
		  height: 24px;
		  flex: none;
		  font-size: 14px;
		}

		.dsh-capmap-entryLabel {
		  overflow: hidden;
		  text-overflow: ellipsis;
		}

		[data-dsh-frame][data-sidebar-collapsed] .dsh-capmap-entry,
		[data-sidebar-collapsed] .dsh-capmap-entry {
		  justify-content: center;
		  padding: 0;
		  width: 36px;
		  height: 36px;
		  margin: 0 auto 12px;
		  border-radius: 50%;
		}

		[data-dsh-frame][data-sidebar-collapsed] .dsh-capmap-entryLabel,
		[data-sidebar-collapsed] .dsh-capmap-entryLabel {
		  display: none;
		}
		`;
		function ensureCapMapStyles() {
		  if (typeof document === "undefined") return;
		  if (document.getElementById(STYLE_ID)) return;
		  const el = document.createElement("style");
		  el.id = STYLE_ID;
		  el.textContent = CSS;
		  document.head.appendChild(el);
		}
		var entryCss = {
		  entry: "dsh-capmap-entry",
		  entryIcon: "dsh-capmap-entryIcon",
		  entryLabel: "dsh-capmap-entryLabel"
		};

		// src/client/sidebar-entry.ts
		var ENTRY_SELECTOR = "[data-dsh-capmap-entry]";
		var ICON = "\u25C8";
		function mountSidebarEntry2(controller) {
		  return mountSidebarEntry({
		    rowAttribute: "data-dsh-capmap-entry",
		    rowSelector: ENTRY_SELECTOR,
		    plugin: "capmap-viz",
		    icon: ICON,
		    css: entryCss,
		    label: () => "\u80FD\u529B\u5E95\u56FE",
		    tooltip: () => "\u80FD\u529B\u5E95\u56FE",
		    onToggle: () => {
		      controller.togglePanel();
		    },
		    position: "after",
		    familySelectors: [
		      "[data-dsh-taskboard-entry]",
		      "[data-dsh-ssh-entry]",
		      "[data-dsh-capmap-entry]"
		    ],
		    active: {
		      subscribe: (listener) => controller.subscribe(listener),
		      isOpen: () => controller.isOpen()
		    }
		  });
		}

		// src/client/index.tsx
		var CAPMAP_RPC_CHANNEL = "/capmap";
		var inject = ["connection", "workspaces"];
		var claimed = false;
		function apply(ctx) {
		  if (claimed) return;
		  claimed = true;
		  try {
		    ensureCapMapStyles();
		  } catch (error) {
		    console.error("[dsh-capmap-viz] styles failed", error);
		  }
		  const controller = new CapMapPanelController();
		  const call = (endpoint, payload) => ctx.connection.rpc.call(CAPMAP_RPC_CHANNEL, endpoint, payload);
		  const disposers = [];
		  try {
		    disposers.push(mountSidebarEntry2(controller));
		    disposers.push(
		      mountPanel(controller, {
		        call,
		        workspaces: ctx.workspaces
		      })
		    );
		  } catch (error) {
		    console.error("[dsh-capmap-viz] mount failed", error);
		  }
		  ctx.effect(() => {
		    return () => {
		      for (const dispose of disposers.splice(0)) dispose();
		      claimed = false;
		    };
		  }, "capmap-viz: mount");
		}

		return module.exports;
	}
});
