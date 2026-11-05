# VORON 2.4r2 — 模型来源与转换

原作者：VORON Design 与项目贡献者。

官方项目：https://github.com/VoronDesign/Voron-2

原始CAD（STEP压缩包）：https://github.com/VoronDesign/Voron-2/blob/Voron2.4/CAD/Voron_2.4r2_Assembly_STEP.zip

原始CAD（Fusion）：https://github.com/VoronDesign/Voron-2/blob/Voron2.4/CAD/Voron_2.4r2_Assembly.f3d

许可：GNU GPL v3.0，见本目录 LICENSE.txt。模型并非本网站原创设计。

本版修改（2026-11-03）：以Open Cascade读取STEP，按0.7模型单位线性误差及0.4弧度角度参数进行网格化，输出GLB；网页归一化缩放、坐标转换；增加中文功能分类、部件选择、透明观察、分组分层及独立零件展开。拆解位移属于展示动画，不是装配工艺。保持原始零件名作为检索与追溯依据。

对应转换脚本：完整网站源文件中的 scripts/convert-voron.py。源CAD可从上述官方链接取得。本模型没有接入CoreXY运动仿真、打印轨迹或温度仿真。自动分组需要以官方BOM和装配手册进一步核对。

## 2026-11-04 交互整理

改为10组关键结构：平面驱动、横梁与平面导向、龙门升降驱动、垂直导轨、齿轮送料、热端与喷嘴、风扇与风道、打印平台、机架、外罩与门板。零件几何保持，螺丝、电子辅助件不再逐条呈现。增加结构可见性、辅助细节开关与按组拆解。取消先前的红转绿配色，保留CAD原始颜色并使用中性灯光；选中时临时加亮，清除后恢复。

新增独立SVG机构运动教学示意（CoreXY、直线导向、龙门升降、齿轮送料、风扇），从右侧入口打开。这些不是导入CAD自身的运动仿真，不将固定平台绘制为升降部件。参考官方结构资料：https://docs.vorondesign.com/hardware.html 及 https://docs.vorondesign.com/build/mechanical/ 。
