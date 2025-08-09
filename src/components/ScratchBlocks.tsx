import React, { useEffect, useRef } from 'react';

interface ScratchBlocksProps {
  onCodeChange?: (code: string) => void;
  vmInstance?: any;
}

const ScratchBlocks: React.FC<ScratchBlocksProps> = ({ onCodeChange, vmInstance }) => {
  const blocksRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  useEffect(() => {
    const initializeBlocks = async () => {
      try {
        // Import Scratch Blocks dynamically
        const ScratchBlocks = await import('scratch-blocks');
        
        if (!blocksRef.current) return;

        // Configure blocks
        ScratchBlocks.default.VerticalFlyout.scrollbars = true;
        ScratchBlocks.default.FieldColourSlider.activateEyedropper_ = () => {};

        // Create workspace
        const workspace = ScratchBlocks.default.inject(blocksRef.current, {
          media: '/scratch-blocks/media/',
          zoom: {
            controls: true,
            wheel: true,
            startScale: 0.675,
            maxScale: 4,
            minScale: 0.25,
            scaleSpeed: 1.2
          },
          colours: {
            workspace: '#F9F9F9',
            flyout: '#F9F9F9',
            toolbox: '#FFFFFF',
            toolboxSelected: '#E9EEF2',
            scrollbar: '#CECDCE',
            scrollbarHover: '#CECDCE',
            insertionMarker: '#000000',
            insertionMarkerOpacity: 0.3,
            fieldShadow: 'rgba(255, 255, 255, 0.3)',
            dragShadowOpacity: 0.6
          },
          comments: true,
          disable: false,
          collapse: false,
          sounds: false
        });

        workspaceRef.current = workspace;

        // Define toolbox with basic blocks
        const toolboxXML = `
          <xml>
            <category name="Motion" colour="#4C97FF">
              <block type="motion_movesteps">
                <value name="STEPS">
                  <shadow type="math_number">
                    <field name="NUM">10</field>
                  </shadow>
                </value>
              </block>
              <block type="motion_turnright">
                <value name="DEGREES">
                  <shadow type="math_number">
                    <field name="NUM">15</field>
                  </shadow>
                </value>
              </block>
              <block type="motion_turnleft">
                <value name="DEGREES">
                  <shadow type="math_number">
                    <field name="NUM">15</field>
                  </shadow>
                </value>
              </block>
              <block type="motion_goto">
                <value name="TO">
                  <shadow type="motion_goto_menu">
                    <field name="TO">_random_</field>
                  </shadow>
                </value>
              </block>
            </category>
            <category name="Looks" colour="#9966FF">
              <block type="looks_say">
                <value name="MESSAGE">
                  <shadow type="text">
                    <field name="TEXT">Hello!</field>
                  </shadow>
                </value>
              </block>
              <block type="looks_think">
                <value name="MESSAGE">
                  <shadow type="text">
                    <field name="TEXT">Hmm...</field>
                  </shadow>
                </value>
              </block>
              <block type="looks_show"></block>
              <block type="looks_hide"></block>
            </category>
            <category name="Sound" colour="#CF63CF">
              <block type="sound_play">
                <value name="SOUND_MENU">
                  <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">pop</field>
                  </shadow>
                </value>
              </block>
            </category>
            <category name="Events" colour="#FFD500">
              <block type="event_whenflagclicked"></block>
              <block type="event_whenkeypressed">
                <value name="KEY_OPTION">
                  <shadow type="event_whenkeypressed_menu">
                    <field name="KEY_OPTION">space</field>
                  </shadow>
                </value>
              </block>
            </category>
            <category name="Control" colour="#FF9F00">
              <block type="control_wait">
                <value name="DURATION">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
              </block>
              <block type="control_repeat">
                <value name="TIMES">
                  <shadow type="math_number">
                    <field name="NUM">10</field>
                  </shadow>
                </value>
              </block>
              <block type="control_forever"></block>
            </category>
          </xml>
        `;

        workspace.updateToolbox(toolboxXML);

        // Listen for changes
        workspace.addChangeListener((event: any) => {
          if (event.type === 'create' || event.type === 'delete' || event.type === 'change') {
            if (onCodeChange) {
              const xml = ScratchBlocks.default.Xml.workspaceToDom(workspace);
              const xmlText = ScratchBlocks.default.Xml.domToText(xml);
              onCodeChange(xmlText);
            }
          }
        });

        console.log('Scratch Blocks initialized successfully');
      } catch (error) {
        console.error('Error initializing Scratch Blocks:', error);
        
        // Fallback: Create a simple message if Scratch Blocks fails to load
        if (blocksRef.current) {
          blocksRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <div class="text-center p-8">
                <div class="text-lg font-semibold text-gray-800 mb-2">Scratch Blocks Loading...</div>
                <div class="text-sm text-gray-600 mb-4">The block-based programming interface is initializing.</div>
                <div class="text-xs text-gray-500">If this takes too long, try refreshing the page.</div>
              </div>
            </div>
          `;
        }
      }
    };

    initializeBlocks();

    // Cleanup
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, [onCodeChange]);

  return (
    <div className="h-full w-full">
      <div ref={blocksRef} className="h-full w-full" />
    </div>
  );
};

export default ScratchBlocks;
