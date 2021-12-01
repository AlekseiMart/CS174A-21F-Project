import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class BlackJack extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            table: new defs.Regular_2D_Polygon(100,100),
            player: new defs.Regular_2D_Polygon(100,100),
            card_deck: new defs.Cube(),
            one_card: new defs.Square(),
        };

        // *** Materials
        this.materials = {
            table: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: hex_color("#0a6c03")}),
            player: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: hex_color("#ffffff")}),
            card_deck: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: hex_color("#ffffff")}),
            back: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/Back.jpg", "NEAREST"),}),
            cA: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c01.png", "NEAREST"),}),
            c2: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c02.png", "NEAREST"),}),
            c3: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c03.png", "NEAREST"),}),
            c4: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c04.png", "NEAREST"),}),
            c5: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c05.png", "NEAREST"),}),
            c6: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c06.png", "NEAREST"),}),
            c7: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c07.png", "NEAREST"),}),
            c8: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c08.png", "NEAREST"),}),
            c9: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c09.png", "NEAREST"),}),
            c10: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c10.png", "NEAREST"),}),
            cJ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c11.png", "NEAREST"),}),
            cQ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c12.png", "NEAREST"),}),
            cK: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/c13.png", "NEAREST"),}),

            dA: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d01.png", "NEAREST"),}),
            d2: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d02.png", "NEAREST"),}),
            d3: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d03.png", "NEAREST"),}),
            d4: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d04.png", "NEAREST"),}),
            d5: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d05.png", "NEAREST"),}),
            d6: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d06.png", "NEAREST"),}),
            d7: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d07.png", "NEAREST"),}),
            d8: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d08.png", "NEAREST"),}),
            d9: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d09.png", "NEAREST"),}),
            d10: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d10.png", "NEAREST"),}),
            dJ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d11.png", "NEAREST"),}),
            dQ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d12.png", "NEAREST"),}),
            dK: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/d13.png", "NEAREST"),}),

            hA: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h01.png", "NEAREST"),}),
            h2: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h02.png", "NEAREST"),}),
            h3: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h03.png", "NEAREST"),}),
            h4: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h04.png", "NEAREST"),}),
            h5: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h05.png", "NEAREST"),}),
            h6: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h06.png", "NEAREST"),}),
            h7: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h07.png", "NEAREST"),}),
            h8: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h08.png", "NEAREST"),}),
            h9: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h09.png", "NEAREST"),}),
            h10: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h10.png", "NEAREST"),}),
            hJ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h11.png", "NEAREST"),}),
            hQ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h12.png", "NEAREST"),}),
            hK: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/h13.png", "NEAREST"),}),
                
            sA: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s01.png", "NEAREST"),}),
            s2: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s02.png", "NEAREST"),}),
            s3: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s03.png", "NEAREST"),}),
            s4: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s04.png", "NEAREST"),}),
            s5: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s05.png", "NEAREST"),}),
            s6: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s06.png", "NEAREST"),}),
            s7: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s07.png", "NEAREST"),}),
            s8: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s08.png", "NEAREST"),}),
            s9: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s09.png", "NEAREST"),}),
            s10: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s10.png", "NEAREST"),}),
            sJ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s11.png", "NEAREST"),}),
            sQ: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s12.png", "NEAREST"),}),
            sK: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/s13.png", "NEAREST"),}),   
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.bal = 1000;
        this.hitNum = 0;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Bet 1", ["1"], () => this.updateBal = () => 1);
        this.key_triggered_button("Bet 10", ["2"], () => this.updateBal = () => 10);
        this.key_triggered_button("Bet 50", ["3"], () => this.updateBal = () => 50);
        this.key_triggered_button("Bet 100", ["4"], () => this.updateBal = () => 100);
        this.new_line();
        this.key_triggered_button("Deal Cards", ["0"], () => this.deal = () => 1);
        this.new_line();
        this.key_triggered_button("HitFirst", ["H"], () => this.hit1 = () => 1);
        this.key_triggered_button("HitSecond", ["J"], () => this.hit2 = () => 1);
        this.key_triggered_button("HitThird", ["K"], () => this.hit3 = () => 1);
        this.new_line();
        this.key_triggered_button("Stand", ["S"], () => this.stand = () => 1);
        this.key_triggered_button("Double", ["D"], () => this.double = () => 1);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const yellow = hex_color("#fac91a");
        let model_transform = Mat4.identity();
        const light_position = vec4(0, 1, 0, 1);  
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10)];
        model_transform = model_transform.times(Mat4.scale(.5, .5, .5)).times(Mat4.translation(0,-9,0.1));
        this.shapes.player.draw(context, program_state, model_transform, this.materials.player);
        model_transform = model_transform.times(Mat4.translation(0,7,-0.1)).times(Mat4.scale(3, 3, 1.5));
        model_transform = model_transform.times(Mat4.scale(.7, .9, .9)).times(Mat4.translation(4,3,1));
        this.shapes.card_deck.draw(context, program_state, model_transform, this.materials.card_deck);
        model_transform = model_transform.times(Mat4.translation(-4,-2,-1)).times(Mat4.scale(26/3, 4, 2/3));
        this.shapes.table.draw(context, program_state, model_transform, this.materials.table);
        if(this.deal && this.deal() !== null){
            model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(2,3,.8)).times(Mat4.translation(-2.8, -4.5, 0));
            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.cK);
            
            model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(2,2.5,.8)).times(Mat4.translation(-2.8, 0, 0));
            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.c3);

            model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4,3,.8)).times(Mat4.translation(-5.2, -4.5, 0));
            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.cQ);

            model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4,2.5,.8)).times(Mat4.translation(-5.2, 0, 0));
            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.cJ);
        }
        if(this.hit1 && this.hit1() !== null){
            if(!this.deal){
                this.hit1 = 0;
            }
            else{
                model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.8,3,.81)).times(Mat4.translation(-5.2, -4.5, 0));
                this.shapes.one_card.draw(context, program_state, model_transform, this.materials.cQ);
            }
        }
        if(this.hit2 && this.hit2() !== null){
            if(!this.deal || !this.hit1){
                this.hit2 = 0;
            }
            else{
                model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(5.1,3,.82)).times(Mat4.translation(-5.2, -4.5, 0));
                this.shapes.one_card.draw(context, program_state, model_transform, this.materials.cJ);
            }
        }
        if(this.hit3 && this.hit3() !== null){
            if(!this.deal || !this.hit2){
                this.hit3 = 0;
            }
            else{
                model_transform = Mat4.identity().times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(5.4,3,.83)).times(Mat4.translation(-5.2, -4.5, 0));
                this.shapes.one_card.draw(context, program_state, model_transform, this.materials.c10);
            }
        }
        this.card_test_transform = Mat4.translation(0, 0, 2);
        /*this.shapes.card_test.arrays.texture_coord.forEach(
            (v, i, l) => l[i] = vec(v[0]*2, v[1]*2)
        );*/
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec4 vertex_color;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vertex_color = vec4( shape_color.xyz * ambient, shape_color.w );
                vertex_color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vertex_color;
                // Compute the final color with contributions from lights:
                
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}