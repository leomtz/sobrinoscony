import resolve from 'rollup-plugin-node-resolve';
 
export default {
    input: 'src/becarios2018.js',
    output: {
        file: 'src/becariosbundle2018.js',
        format: 'umd',
        name: "app"
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            module: true
        })
    ]
};