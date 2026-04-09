import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Tree, Dropdown, Button, Input, Spin, message } from "antd";
import { EllipsisOutlined, LeftOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
import { OutlineSlideVo } from "@/models/outlineSlideVo";
// import { OutlineVo } from "@/models/outlineVo";

interface TreeManagementProps {
  initialData?: OutlineSlideVo[] | null;
  onChange?: (data: OutlineSlideVo[]) => void;
  loading?: boolean;
  disabled?: boolean;
  preStep: () => void;
  onSubmitData?: (data: OutlineSlideVo[]) => void;
}

export interface TreeManagementRef {
  getValidatedData: () => Promise<OutlineSlideVo[]>;
}

/** 仅前端使用的稳定 key，不影响后端模型 */
type SlideWithKey = OutlineSlideVo & { _key: string };

/** 确保每个 slide 都有稳定 _key（只用于 UI） */
function ensureKeys(slides: OutlineSlideVo[]): SlideWithKey[] {
  return slides.map((s) => {
    const anyS = s as any;
    if (!anyS._key) anyS._key = nanoid();
    return anyS as SlideWithKey;
  });
}

/** 输出给外部（onChange/onSubmit/ref）时，去掉 _key，避免污染后端结构 */
function stripKeys(slides: SlideWithKey[]): OutlineSlideVo[] {
  const cleaned = cloneDeep(slides) as any[];
  cleaned.forEach((s) => {
    delete s._key;
  });
  return cleaned as OutlineSlideVo[];
}

const TreeManagement = forwardRef<TreeManagementRef, TreeManagementProps>(
  (
    {
      initialData = null,
      onChange,
      loading = false,
      disabled = false,
      preStep,
      onSubmitData,
    },
    ref
  ) => {
    const [treeData, setTreeData] = useState<SlideWithKey[]>([]);
    const [editingNode, setEditingNode] = useState<{
      key: string;
      field: "title" | "description";
    } | null>(null);

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [invalidKeys, setInvalidKeys] = useState<string[]>([]);

    /** ✅ 草稿值用 ref，避免每次输入触发重渲染导致光标跳到最后 */
    const editingDraftRef = useRef<string>("");

    /** 根据当前 slides 输出数据（去掉 _key），避免污染后端结构 */
    const buildOutline = useCallback(
      (slidesWithKey: SlideWithKey[]): OutlineSlideVo[] => {
        return stripKeys(slidesWithKey);
      },
      []
    );

    // 初始化数据
    useEffect(() => {
      if (initialData?.length) {
        const slidesWithKey = ensureKeys(initialData);

        // 兜底更新 slideNo（如果后端没给或乱了）
        const updated = slidesWithKey.map((node, index) => ({
          ...node,
          slideNo: index + 1,
        }));

        setTreeData(updated);
        setExpandedKeys(updated.map((s) => s._key));
      } else {
        setTreeData([]);
        setExpandedKeys([]);
      }

      setInvalidKeys([]);
      setEditingNode(null);
      editingDraftRef.current = "";
    }, [initialData]);

    // 校验函数：标题/内容不能为空
    const validateTree = useCallback(() => {
      const invalid = treeData
        .filter((node) => !node.title?.trim() || !node.description?.trim())
        .map((node) => node._key);

      if (invalid.length > 0) {
        setInvalidKeys(invalid);
        return Promise.reject(
          new Error(`有${invalid.length}个节点的标题或内容为空`)
        );
      }

      setInvalidKeys([]);
      return Promise.resolve(treeData);
    }, [treeData]);

    // 处理添加操作
    const handleAdd = useCallback(
      (type: string, baseIndex: number) => {
        const newNode: any = new OutlineSlideVo();
        newNode._key = nanoid();
        newNode.title = "";
        newNode.description = "";
        newNode.slideType = "content";
        newNode.contentPoint = [];

        let insertIndex = treeData.length;
        let newTreeData: SlideWithKey[] = [];

        switch (type) {
          case "addAbove": {
            insertIndex = baseIndex;
            newTreeData = [
              ...treeData.slice(0, baseIndex),
              newNode as SlideWithKey,
              ...treeData.slice(baseIndex),
            ];
            break;
          }
          case "addBelow": {
            insertIndex = baseIndex + 1;
            newTreeData = [
              ...treeData.slice(0, baseIndex + 1),
              newNode as SlideWithKey,
              ...treeData.slice(baseIndex + 1),
            ];
            break;
          }
          default: {
            newTreeData = [...treeData, newNode as SlideWithKey];
            break;
          }
        }

        // 更新 slideNo 顺序
        const updatedTreeData = newTreeData.map((node, index) => ({
          ...node,
          slideNo: index + 1,
        }));

        setTreeData(updatedTreeData);
        setExpandedKeys(updatedTreeData.map((s) => s._key));

        if (onChange) {
          onChange(buildOutline(updatedTreeData));
        }

        // 新增节点进入编辑标题
        const actualNewNode =
          updatedTreeData[insertIndex] ??
          updatedTreeData[updatedTreeData.length - 1];

        setEditingNode({ key: actualNewNode._key, field: "title" });
        editingDraftRef.current = ""; // 新节点标题为空
      },
      [treeData, onChange, buildOutline]
    );

    // 处理删除操作（按 key 删，避免 index 错位）
    const handleDelete = useCallback(
      (key: string) => {

        if(treeData.length<=1){
          message.error("至少需要一个节点");
          return;
        }
        const newTreeData = treeData.filter((n) => n._key !== key);

        const updatedTreeData = newTreeData.map((node, i) => ({
          ...node,
          slideNo: i + 1,
        }));

        setTreeData(updatedTreeData);
        setExpandedKeys(updatedTreeData.map((s) => s._key));

        if (editingNode?.key === key) {
          setEditingNode(null);
          editingDraftRef.current = "";
        }

        setInvalidKeys((prev) => prev.filter((k) => k !== key));

        if (onChange) {
          onChange(buildOutline(updatedTreeData));
        }
      },
      [treeData, onChange, buildOutline, editingNode]
    );

    // ✅ 编辑提交：使用 ref 草稿值，不使用 state（避免光标问题）
    const handleEditSubmit = useCallback(() => {
      if (!editingNode) return;

      const { key, field } = editingNode;
      const index = treeData.findIndex((item) => item._key === key);
      if (index === -1) return;

      const newTreeData = [...treeData];
      newTreeData[index] = {
        ...newTreeData[index],
        [field]: editingDraftRef.current,
      };

      setTreeData(newTreeData);
      setEditingNode(null);

      // 更新无效标红
      const stillInvalid = newTreeData
        .filter((n) => !n.title?.trim() || !n.description?.trim())
        .map((n) => n._key);
      setInvalidKeys(stillInvalid);

      if (onChange) {
        onChange(buildOutline(newTreeData));
      }
    }, [editingNode, treeData, onChange, buildOutline]);

    const handleExpand = (keys: React.Key[]) => {
      setExpandedKeys(keys);
    };

    const renderTreeNode = useCallback(
      (nodeData: SlideWithKey, index: number) => {
        const isEditingTitle =
          editingNode?.key === nodeData._key && editingNode?.field === "title";
        const isEditingDescription =
          editingNode?.key === nodeData._key &&
          editingNode?.field === "description";
        const isInvalid = invalidKeys.includes(nodeData._key);

        return (
          <div className="flex justify-between items-center w-full min-h-8 group/node">
            <div className="flex-1 flex gap-5">
              <div className="flex-grow-0 w-10 flex justify-center items-start p-3">
                P{nodeData.slideNo}
              </div>

              <div className="flex-1 grid p-2">
                {isEditingTitle ? (
                  <Input
                    key={`${nodeData._key}-title`} // ✅ 切换编辑对象时强制重建，defaultValue 才会更新
                    size="small"
                    autoFocus
                    defaultValue={editingDraftRef.current}
                    onChange={(e) => (editingDraftRef.current = e.target.value)}
                    onPressEnter={handleEditSubmit}
                    onBlur={handleEditSubmit}
                    className={isInvalid ? "border-red-500" : ""}
                  />
                ) : (
                  <div
                    className={`p-1 ${
                      isInvalid ? "border-red-600 border rounded-[4px]" : ""
                    }`}
                    onClick={() => {
                      if (!loading && !disabled) {
                        setEditingNode({ key: nodeData._key, field: "title" });
                        editingDraftRef.current = nodeData.title ?? "";
                      }
                    }}
                  >
                    {nodeData.title || (
                      <span className="text-gray-400">点击编辑标题</span>
                    )}
                  </div>
                )}

                {isEditingDescription ? (
                  <Input.TextArea
                    key={`${nodeData._key}-description`}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    size="small"
                    defaultValue={editingDraftRef.current}
                    onChange={(e) => (editingDraftRef.current = e.target.value)}
                    onPressEnter={handleEditSubmit}
                    onBlur={handleEditSubmit}
                  />
                ) : (
                  <div
                    className="p-1 text-gray-500 text-sm"
                    onClick={() => {
                      if (!loading && !disabled) {
                        setEditingNode({
                          key: nodeData._key,
                          field: "description",
                        });
                        editingDraftRef.current = nodeData.description ?? "";
                      }
                    }}
                  >
                    {nodeData.description || (
                      <span className="text-gray-400">点击编辑描述</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!disabled && (
              <div className="flex-none min-w-20 flex justify-center">
                <Dropdown
                  menu={{
                    items: [
                      { key: "addAbove", label: "添加上方" },
                      { key: "addBelow", label: "添加下方" },
                      { key: "delete", label: "删除", danger: true },
                    ],
                    onClick: (e) => {
                      e.domEvent.stopPropagation();

                      if (e.key === "delete") {
                        handleDelete(nodeData._key);
                      } else {
                        handleAdd(e.key, index);
                      }
                    },
                  }}
                  trigger={["click"]}
                  disabled={loading}
                >
                  <Button
                    type="text"
                    disabled={loading}
                    className="hidden group-hover/node:block"
                    icon={<EllipsisOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            )}
          </div>
        );
      },
      [
        editingNode,
        handleEditSubmit,
        handleDelete,
        handleAdd,
        invalidKeys,
        loading,
        disabled,
      ]
    );

    useImperativeHandle(ref, () => ({
      getValidatedData: () => {
        return validateTree().then((data) => buildOutline(data));
      },
    }));

    return (
      <div className="h-full flex flex-col bg-fill-container rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center flex-col gap-2 flex-1">
            <Spin size="large" spinning={loading} tip="正在生成大纲，请稍后..." />
          </div>
        ) : (
          <>
            <div className="flex-none font-bold text-xl p-5">
              <Button
                type="text"
                className="cursor-pointer mr-2 p-2"
                onClick={() => preStep()}
              >
                <LeftOutlined />
              </Button>
              内容大纲
            </div>

            <div className="flex-1 overflow-auto p-5">
              {(treeData && treeData.length > 0) ? <Tree
                treeData={treeData.map((node, index) => ({
                  key: node._key,
                  title: renderTreeNode(node, index),
                }))}
                expandedKeys={expandedKeys}
                onExpand={handleExpand}
                selectable={false}
                blockNode
              /> : <div className="h-full flex items-center justify-center">
                <span className="text-gray-400">暂无数据,请稍后再试</span>
              
              </div>

              
              }
            </div>

            <div className="mt-6 flex-none">
              <Button
                type="primary"
                block
                disabled={
                  !treeData || treeData.length === 0 || loading
                }
                onClick={() => {
                  validateTree()
                    .then((data) => {
                      const outline = buildOutline(data);
                      onSubmitData?.(outline);
                    })
                    .catch((err) => {
                      message.error(err.message);
                    });
                }}
              >
                下一步: 选择模板
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
);

export default TreeManagement;
