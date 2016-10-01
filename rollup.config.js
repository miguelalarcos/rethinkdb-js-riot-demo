import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import riot from 'rollup-plugin-riot';

export default {
    entry: 'main.js',
    format: 'iife',
    //sourceMap: true,
    plugins: [riot(), nodeResolve({browser: true, main:true, jsnext: true}), commonjs(), babel()],
    dest: 'bundle.js'
};
