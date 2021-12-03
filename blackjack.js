import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Capped_Cylinder, Torus, Cylindrical_Tube} = defs
let a = 0;
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
            drop_shadow: new defs.Square(),
            drop_shadow_blur: new defs.Square(),
            tableedge: new defs.Torus(100, 100),
        };

        // *** Materials
        this.materials = {
            player: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: hex_color("#ffffff")}),
            card_deck: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/card_deck.jpg", "NEAREST"),}),
            back: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/cards/Back.jpg", "NEAREST"),}), 
            // shadow: new Material(new Textured_Phong(), {
            //     color: hex_color("#5D5C5D"), ambient: 0.2, texture: new Texture("assets/tabletop.jpg", "NEAREST"),}),
            shadow: new Material(new defs.Phong_Shader(),
                {ambient: 1, 
                    diffusivity: 1, 
                    color: color(0, 0, 0, 0.93),
                    smoothness: 100,
                }),
            auxiliary_blur: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/custom_blur.png", "NEAREST"),}), 
            green_table: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/green.jpg", "NEAREST"),}), 
            blue_table: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/blue.jpg", "NEAREST"),}), 
            green_tableedge: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/table_edge.jpg", "NEAREST"),}), 
            blue_tableedge: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/table_edge2.jpg", "NEAREST"),}), 
            
        }
        //card deck creation + card textures
        var suit = ["s", "h", "d", "c"];
        var vals = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        this.deck = new Array();
        for(var i = 0; i < suit.length; ++i){
            for(var j = 0; j < vals.length; ++j){
                var worth = j + 2;
                if (vals[j] == "J" || vals[j] == "Q" || vals[j] == "K")
                    worth = 10;
                if (vals[j] == "A")
                    worth = 11;
                let fName = "assets/cards/" + suit[i] + vals[j] + ".png"
                var card = {suitVal: suit[i]+vals[j], Worth: worth, Texture: 
                new Material(new Card_Texture(),
                {color: hex_color("#000000"), ambient: 1, texture: new Texture(fName, "NEAREST") })
                };
                this.deck.push(card);
            }
        }
        for(var i = this.deck.length-1; i > 0; --i){
            var j = Math.floor(Math.random() * (i + 1));
            var k = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = k;
        }


        this.initial_camera_location = Mat4.look_at(vec3(0, -20, 15), vec3(0, 0, 0), vec3(0, 1, 0));
        this.bal = 1000;
        this.dealt = -1;
        this.dealer_dealt = -1;
        this.player_total = 0;
        this.dealer_total = 0;
        this.table_texture = 0;
        this.c1;
        this.c2;
        this.c3;
        this.c4;
        this.c5;
        this.c6;
        this.c7;
        this.c8;
        this.c9;
        this.c10;
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
        this.new_line();
        this.key_triggered_button("Green Table", ["G"], () => {
            this.table_texture = 0;
        });
        this.key_triggered_button("Blue Table", ["B"], () => {
            this.table_texture = 1;
        });
    }

    make_shadow(context, program_state, model_transform) {
        // let model_shadow = model_transform.times(Mat4.translation(0, 0, -0.5));
        
        // define level position on table surface
        let model_shadow = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7));
        model_shadow = model_shadow.times(Mat4.scale(.5, .5, .5)).times(Mat4.translation(0,-9,0.1));
        model_shadow = model_shadow.times(Mat4.scale(.9, .9, .9));

        // --> prevents layer inversion
        let card_height = model_transform[2][3];
        if (card_height < model_shadow[2][3]) return;
        
        // orthogonal projection
        model_shadow[0] = model_transform[0];
        model_shadow[1] = model_transform[1];

        // shadow spread dependent on height of object from bed of table
        let spread_factor = Math.max( Math.cbrt((card_height+1) * 0.8), 1);
        model_shadow = model_shadow.times(Mat4.scale(spread_factor, spread_factor, 0));
        
        // simulating diffusion
        let center_opacity = Math.max(0.8, 1/spread_factor);
        this.materials.shadow.color[3] = center_opacity;
        // this.materials.shadow.specularity = 1;
        // this.materials.shadow.smoothness = 20;

        // simulating projection due to incident angle with light source
        let x_pos = model_transform[0][3], y_pos = model_transform[1][3];

        let fov_y = Math.PI/2, 
            aspect = context.width / (context.height*1.7), 
            near = 0.1,
            far = 1, 
            d = far - near;
        const f = 1 / Math.tan(fov_y / 2);
            

        // determining light quadrant
        function four_quad_projection() {
            // Quad 1
            if (x_pos > 0 && y_pos > 0) {
                near *= - Math.min(Math.abs(x_pos), 1) * Math.min(Math.abs(y_pos), 1);
                far *= - Math.min(Math.abs(x_pos), 1) * Math.min(Math.abs(y_pos), 1);
            }
            // Quad 2
            else if (x_pos < 0 && y_pos > 0) {
                near *= - Math.min(Math.abs(x_pos), 1) * Math.min(Math.abs(y_pos), 1);
            }
            
            // Quad 3
            else if (x_pos < 0 && y_pos < 0) {
                near *= - Math.min(Math.abs(x_pos), 1) * Math.min(Math.abs(y_pos), 1);
                far *= - Math.min(Math.abs(x_pos), 1) * Math.min(Math.abs(y_pos), 1);
            }
            
            // Quad 4
            else if (x_pos > 0 && y_pos < 0) {
                near *= - Math.min(Math.abs(x_pos), 1) * Math.min(Math.abs(y_pos), 1);
            }
        }
        
        let perpective_proj = Matrix.of(
            [f / aspect, 0, -(near + far) / d, -2 * near * far / d],
            [0, f, -(near + far) / d, -2 * near * far / d],
            [0, 0, 1, 0],
            [0, 0, -1, 1]);
        
        
        // absolute value offset method
        let factor = card_height * 3 * 10**-2, 
            x_offset = x_pos * factor, 
            y_offset = y_pos * factor;

        let offset_proj = Matrix.of(
            [1, 0, 0, x_offset],
            [0, 1, 0, y_offset],
            [0, 0, 1, 0],
            [0, 0, 0, 1]);
        
        model_shadow = model_shadow.times(offset_proj);

        // console.log(model_transform[1]);
        // console.log(model_shadow[2]);
        
        this.shapes.drop_shadow.draw(context, program_state, model_shadow, this.materials.shadow);

        // this.materials.shadow.color[3] = center_opacity * 0.9
        // this.shapes.drop_shadow.draw(context, program_state, diffusion_matrix, this.materials.shadow);
        
        // generate diffusion effect
        let num_rings = 500;
        this.materials.shadow.color[0] = 0;
        this.materials.shadow.color[1] = 0;
        this.materials.shadow.color[2] = 0;
        for (let i = 1; i < num_rings; i+=2) {
            // apply diffusion borders
            let diffusion_factor = 1 + (spread_factor-1) * i * 10**-2;
            let diffusion_matrix = model_shadow.times(
                Mat4.scale(diffusion_factor, diffusion_factor, diffusion_factor));
            diffusion_matrix[2][3] -= 0.05*i/num_rings;

            // reduce intensity in diffused shadow
            this.materials.shadow.color[3] = center_opacity * Math.max(0, Math.cos( (1-1/(i)) * Math.PI/2));

            this.shapes.drop_shadow.draw(context, program_state, diffusion_matrix, this.materials.shadow);
        }




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
        let model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7));
        let card_deck_top_transform = model_transform;
        let card_deck_transform = model_transform;

        const light_position = vec4(0, 10, 10, 1);  
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 50)];
        // program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10 ** (t % 100))];

        model_transform = model_transform.times(Mat4.scale(.5, .5, .5)).times(Mat4.translation(0,-9,0.1));
        //this.shapes.player.draw(context, program_state, model_transform, this.materials.player);
        model_transform = model_transform.times(Mat4.translation(0,7,-0.1)).times(Mat4.scale(3, 3, 1.5));
        model_transform = model_transform.times(Mat4.scale(.7, .9, .9)).times(Mat4.translation(4,3,1));
        card_deck_transform = card_deck_transform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(.675, 1.35, 1.05)).times(Mat4.translation(-1, 2.26, 4));
        this.shapes.card_deck.draw(context, program_state, card_deck_transform, this.materials.card_deck);
        card_deck_top_transform = model_transform.times(Mat4.translation(0, 0, 1.01));
        this.shapes.one_card.draw(context, program_state, card_deck_top_transform, this.materials.back);
        model_transform = model_transform.times(Mat4.translation(-4,-2,-1)).times(Mat4.scale(26/3, 4, 2/3));
        if (this.table_texture == 0) {
            this.shapes.table.draw(context, program_state, model_transform, this.materials.green_table);
            model_transform = model_transform.times(Mat4.scale(1.71, 1.71, 8));
            this.shapes.tableedge.draw(context, program_state, model_transform, this.materials.green_tableedge);
        } else if (this.table_texture == 1) {
            this.shapes.table.draw(context, program_state, model_transform, this.materials.blue_table);
            model_transform = model_transform.times(Mat4.scale(1.71, 1.71, 8));
            this.shapes.tableedge.draw(context, program_state, model_transform, this.materials.blue_tableedge);
        } else {

        }

        if(this.deal && this.deal() !== null){
            if(this.dealt == -1){           
                this.c1 = this.deck.pop();
                this.c2 = this.deck.pop();
                this.c3 = this.deck.pop();
                this.c4 = this.deck.pop();
                this.player_total += this.c1.Worth;
                this.player_total += this.c2.Worth;
                this.dealer_total += this.c3.Worth;
                this.dealer_total += this.c4.Worth;
                this.dealt = 1;
                a=t;
            }
            if((t-a) < 1){
                model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a)*1));
                this.shapes.one_card.draw(context, program_state, model_transform, this.c1.Texture);
                this.make_shadow(context, program_state, model_transform);

            }
            else if((t-a) < 2){
                model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-1)*-5,(t-a-1)*-4.5, 0));
                this.shapes.one_card.draw(context, program_state, model_transform, this.c1.Texture);
                this.make_shadow(context, program_state, model_transform);

            }
            else if((t-a) < 3){
                model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.995-(t-a-2))*1)).times(Mat4.translation(-5,-4.5, 0));
                this.shapes.one_card.draw(context, program_state, model_transform, this.c1.Texture);
                this.make_shadow(context, program_state, model_transform);
            }
            else{
                model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.005)).times(Mat4.translation(-5, -4.5, 0));
                this.shapes.one_card.draw(context, program_state, model_transform, this.c1.Texture);
                this.make_shadow(context, program_state, model_transform);


                if((t-a) < 4){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-3)*1));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c2.Texture);
                    this.make_shadow(context, program_state, model_transform);
                }
                else if((t-a) < 5){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-4)*-4.7,(t-a-4)*-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c2.Texture);
                    this.make_shadow(context, program_state, model_transform);
                }
                else if((t-a) < 6){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.99-(t-a-5))*1)).times(Mat4.translation(-4.7,-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c2.Texture);
                    this.make_shadow(context, program_state, model_transform);
                }
                else{
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.01)).times(Mat4.translation(-4.7, -4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c2.Texture);
                    this.make_shadow(context, program_state, model_transform);
                    if((t-a) < 7){
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-6)*1));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c3.Texture);
                        this.make_shadow(context, program_state, model_transform);
                    }
                    else if((t-a) < 8){
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-7)*-5,0, 0));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c3.Texture);
                        this.make_shadow(context, program_state, model_transform);
                    }
                    else if((t-a) < 9){
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.995-(t-a-8))*1)).times(Mat4.translation(-5,0, 0));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c3.Texture);
                        this.make_shadow(context, program_state, model_transform);
                    }
                    else{
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.005)).times(Mat4.translation(-5, 0, 0));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c3.Texture);
                        this.make_shadow(context, program_state, model_transform);

                        if((t-a) < 10){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-9)*1));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.back);
                            this.make_shadow(context, program_state, model_transform);
                        }
                        else if((t-a) < 11){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-10)*-4.7,0, 0));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.back);
                            this.make_shadow(context, program_state, model_transform);
                        }
                        else if((t-a) < 12){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.99-(t-a-11))*1)).times(Mat4.translation(-4.7,0, 0));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.back);
                            this.make_shadow(context, program_state, model_transform);
                        }
                        else if(!this.stand){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.01)).times(Mat4.translation(-4.7, 0, 0));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.materials.back);
                            this.make_shadow(context, program_state, model_transform);
                        }
                    }
                }
            }
        }

        if(this.hit1 && this.hit1() !== null){
            if(!this.deal){
                this.hit1 = 0;
            }
            else{
                if(this.dealt == 1){
                    this.c5 = this.deck.pop();
                    this.player_total += this.c5.Worth;
                    this.dealt = 2;
                    a = t-12;
                }
                if((t-a) < 13){
                model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-12)*1));
                this.shapes.one_card.draw(context, program_state, model_transform, this.c5.Texture);
                }
                else if((t-a) < 14){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-13)*-4.4,(t-a-13)*-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c5.Texture);
                }
                else if((t-a) < 15){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.985-(t-a-14))*1)).times(Mat4.translation(-4.4,-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c5.Texture);
                }
                else{
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.015)).times(Mat4.translation(-4.4, -4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c5.Texture);
                }
            }
        }
        if(this.hit2 && this.hit2() !== null){
            if(!this.deal || !this.hit1){
                this.hit2 = 0;
            }
            else{
                if(this.dealt == 2){
                    this.c6 = this.deck.pop();
                    this.player_total += this.c6.Worth;
                    this.dealt = 3;
                    a = t-15;
                }
                if((t-a) < 16){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-15)*1));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c6.Texture);
                }
                else if((t-a) < 17){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-16)*-4.1,(t-a-16)*-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c6.Texture);
                }
                else if((t-a) < 18){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.98-(t-a-17))*1)).times(Mat4.translation(-4.1,-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c6.Texture);
                }
                else{
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.02)).times(Mat4.translation(-4.1, -4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c6.Texture);
                }
            }
        }
        if(this.hit3 && this.hit3() !== null){
            if(!this.deal || !this.hit2){
                this.hit3 = 0;
            }
            else{
                if(this.dealt == 3){
                    this.c7 = this.deck.pop();
                    this.player_total += this.c7.Worth;
                    this.dealt = 4;
                    a = t-18;
                }
                if((t-a) < 19){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-18)*1));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c7.Texture);
                }
                else if((t-a) < 20){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-19)*-3.8,(t-a-19)*-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c7.Texture);
                }
                else if((t-a) < 21){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.975-(t-a-20))*1)).times(Mat4.translation(-3.8,-4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c7.Texture);
                }
                else{
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.025)).times(Mat4.translation(-3.8, -4.5, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c7.Texture);
                }
            }
        }

        if(this.stand && this.stand() !== null){
            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.01)).times(Mat4.translation(-4.7, 0, 0));
            this.shapes.one_card.draw(context, program_state, model_transform, this.c4.Texture);
            //console.log(this.dealer_total);
            if(this.dealer_total < 17 || this.dealer_dealt >= 1){
                if(this.dealer_dealt == -1){
                    a = t-21;
                    this.c8 = this.deck.pop();
                    this.dealer_total += this.c8.Worth;
                    this.dealer_dealt = 1;
                }
                if((t-a) < 22){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-21)*1));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c8.Texture);
                }
                else if((t-a) < 23){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-22)*-4.4,0, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c8.Texture);
                }
                else if((t-a) < 24){
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.985-(t-a-23))*1)).times(Mat4.translation(-4.4,0, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c8.Texture);
                }
                else{
                    model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.015)).times(Mat4.translation(-4.4, 0, 0));
                    this.shapes.one_card.draw(context, program_state, model_transform, this.c8.Texture);
                }
                if((this.dealer_total < 17 || this.dealer_dealt >= 2) && (t-a) > 24){
                    if(this.dealer_dealt == 1){
                        a = t-24;
                        this.c9 = this.deck.pop();
                        this.dealer_total += this.c9.Worth;
                        this.dealer_dealt = 2;
                    }
                    if((t-a) < 25){
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-24)*1));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c9.Texture);
                    }
                    else if((t-a) < 26){
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-25)*-4.1,0, 0));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c9.Texture);
                    }
                    else if((t-a) < 27){
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.98-(t-a-26))*1)).times(Mat4.translation(-4.1,0, 0));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c9.Texture);
                    }
                    else{
                        model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.02)).times(Mat4.translation(-4.1, 0, 0));
                        this.shapes.one_card.draw(context, program_state, model_transform, this.c9.Texture);
                    }
                    if((this.dealer_total < 17 || this.dealer_dealt >= 3) && (t-a) > 27){
                        if(this.dealer_dealt == 2){
                            a = t-27;
                            this.c10 = this.deck.pop();
                            this.dealer_total += this.c10.Worth;
                            this.dealer_dealt = 3;
                        }
                        if((t-a) < 28){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(t-a-27)*1));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.c10.Texture);
                        }
                        else if((t-a) < 29){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,1)).times(Mat4.translation((t-a-28)*-3.8,0, 0));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.c10.Texture);
                        }
                        else if((t-a) < 30){
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,(.975-(t-a-29))*1)).times(Mat4.translation(-3.8,0, 0));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.c10.Texture);
                        }
                        else{
                            model_transform = Mat4.identity().times(Mat4.scale(1.7, 1.7, 1.7)).times(Mat4.scale(1.05, 1.35, 2)).times(Mat4.translation(4.02,2.26,.025)).times(Mat4.translation(-3.8, 0, 0));
                            this.shapes.one_card.draw(context, program_state, model_transform, this.c10.Texture);
                        }
                }
                }
            }
        }

        //player_total 
        if(this.player_total > 21){
            console.log("You lose.");
        }
        if(this.player_total == 21 && this.dealt == 1){
            console.log("BLACK JACK!! You won!")
        }

        this.card_test_transform = Mat4.translation(0, 0, 2);
        /*this.shapes.card_test.arrays.texture_coord.forEach(
            (v, i, l) => l[i] = vec(v[0]*2, v[1]*2)
        );*/
    }
}

class Card_Texture extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                
                float u = mod(f_tex_coord.x, 1.0);
                float v = mod(f_tex_coord.y, 1.0);

                if ((u >= 0.975) || (u <= 0.025)) {
                        tex_color = vec4(0, 0, 0, 1.0);
                }
                if ((v >= .982) || (v <= 0.018)) {
                    
                        tex_color = vec4(0, 0, 0, 1.0);
                }

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

class Card__Deck_Texture extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                
                float u = mod(f_tex_coord.x, 1.0);
                float v = mod(f_tex_coord.y, 1.0);

                if ((u >= 0.975) || (u <= 0.025)) {
                        tex_color = vec4(0, 0, 0, 1.0);
                }
                if ((v >= .98) || (v <= 0.02)) {
                    
                        tex_color = vec4(0, 0, 0, 1.0);
                }

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
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