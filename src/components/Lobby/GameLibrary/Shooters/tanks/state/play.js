export default function playState(){
    this.tank = null;
    this.turret = null;
    this.flame = null;
    this.bullet = null;
    this.background = null;
    this.targets = null;
    var land = null;
    this.emitter = null;
    this.power = 300;
    this.powerText = null;
    this.cursors = null;
    this.fireButton = null;

    return{
        create: function(){
            //  Simple but pretty background
            this.background = this.add.sprite(0, 0, 'background');
            //  The targets to hit (hidden behind the land slightly)
            this.targets = this.add.group(this.game.world, 'targets', false, true, window.Phaser.Physics.ARCADE);
            this.targets.create(284, 378, 'target');
            this.targets.create(456, 153, 'target');
            this.targets.create(545, 305, 'target');
            this.targets.create(726, 391, 'target');
            this.targets.create(972, 74, 'target');
            //  Stop gravity from pulling them away
            this.targets.setAll('body.allowGravity', false);
            //  The land is a BitmapData the size of the game world
            //  We draw the 'lang.png' to it then add it to the world
            this.land = this.add.bitmapData(992, 480);
            this.land.draw('land');
            this.land.update();
            this.land.addToWorld();
            //  A small burst of particles when a target is hit
            this.emitter = this.add.emitter(0, 0, 30);
            this.emitter.makeParticles('flame');
            this.emitter.setXSpeed(-120, 120);
            this.emitter.setYSpeed(-100, -200);
            this.emitter.setRotation();
            //  A single bullet that the tank will fire
            this.bullet = this.add.sprite(0, 0, 'bullet');
            this.bullet.exists = false;
            this.physics.arcade.enable(this.bullet);
            //  The body of the tank
            this.tank = this.add.sprite(24, 383, 'tank');
            //  The turret which we rotate (offset 30x14 from the tank)
            this.turret = this.add.sprite(this.tank.x + 30, this.tank.y + 14, 'turret');
            //  When we shoot this little flame sprite will appear briefly at the end of the turret
            this.flame = this.add.sprite(0, 0, 'flame');
            this.flame.anchor.set(0.5);
            this.flame.visible = false;
            //  Used to display the power of the shot
            this.power = 300;
            this.powerText = this.add.text(8, 8, 'Power: 300', { font: "18px Arial", fill: "#ffffff" });
            this.powerText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
            this.powerText.fixedToCamera = true;
            //  Some basic controls
            this.cursors = this.input.keyboard.createCursorKeys();
    
            this.fireButton = this.input.keyboard.addKey(window.Phaser.Keyboard.SPACEBAR);
            this.fireButton.onDown.add(this.fire, this);

        },
        update: function(){
            //  If the bullet is in flight we don't let them control anything
            if (this.bullet.exists)
            {
                //  Bullet vs. the Targets
                this.physics.arcade.overlap(this.bullet, this.targets, this.hitTarget, null, this);
                //  Bullet vs. the land
                this.bulletVsLand();
            }
            else
            {
                //  Allow them to set the power between 100 and 600
                if (this.cursors.left.isDown && this.power > 100)
                {
                    this.power -= 2;
                }
                else if (this.cursors.right.isDown && this.power < 600)
                {
                    this.power += 2;
                }
                //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
                if (this.cursors.up.isDown && this.turret.angle > -90)
                {
                    this.turret.angle--;
                }
                else if (this.cursors.down.isDown && this.turret.angle < 0)
                {
                    this.turret.angle++;
                }
                //  Update the text
                this.powerText.text = 'Power: ' + this.power;
            }
        },
        bulletVsLand: function () {
            //  Simple bounds check
            if (this.bullet.x < 0 || this.bullet.x > this.game.world.width || this.bullet.y > this.game.height)
            {
                this.removeBullet();
                return;
            }
            var x = Math.floor(this.bullet.x);
            var y = Math.floor(this.bullet.y);
            var rgba = this.land.getPixel(x, y);
            if (rgba.a > 0)
            {
                this.land.blendDestinationOut();
                this.land.circle(x, y, 16, 'rgba(0, 0, 0, 255');
                this.land.blendReset();
                this.land.update();
                //  If you like you could combine the above 4 lines:
                // this.land.blendDestinationOut().circle(x, y, 16, 'rgba(0, 0, 0, 255').blendReset().update();
                this.removeBullet();
            }
        },
        fire: function () {
            if (this.bullet.exists)
            {
                return;
            }
            //  Re-position the bullet where the turret is
            this.bullet.reset(this.turret.x, this.turret.y);
            //  Now work out where the END of the turret is
            var p = new window.Phaser.Point(this.turret.x, this.turret.y);
            p.rotate(p.x, p.y, this.turret.rotation, false, 34);
            //  And position the flame sprite there
            this.flame.x = p.x;
            this.flame.y = p.y;
            this.flame.alpha = 1;
            this.flame.visible = true;
            //  Boom
            this.add.tween(this.flame).to( { alpha: 0 }, 100, "Linear", true);
            //  So we can see what's going on when the bullet leaves the screen
            this.camera.follow(this.bullet);
            //  Our launch trajectory is based on the angle of the turret and the power
            this.physics.arcade.velocityFromRotation(this.turret.rotation, this.power, this.bullet.body.velocity);
        },
        hitTarget: function (bullet, target) {
            target.kill();
            this.removeBullet();
        },
        removeBullet: function () {
            this.bullet.kill();
            this.camera.follow();
            this.add.tween(this.camera).to( { x: 0 }, 1000, "Quint", true, 1000);
        },

    }
}