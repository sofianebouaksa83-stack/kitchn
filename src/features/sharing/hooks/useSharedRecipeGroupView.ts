import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { RecipeRow } from "../types/sharing.types";
import { useSharedRecipeGroup } from "./useSharedRecipeGroup";

type UseSharedRecipeGroupViewArgs = {
  groupId: string;
  onEdit?: (recipeId: string) => void;
};

export function useSharedRecipeGroupView({
  groupId,
  onEdit,
}: UseSharedRecipeGroupViewArgs) {
  const group = useSharedRecipeGroup({ groupId });

  const [draggedRecipe, setDraggedRecipe] =
    useState<string | null>(null);

  const [viewingRecipeId, setViewingRecipeId] =
    useState<string | null>(null);

  const [showGroupsModal, setShowGroupsModal] =
    useState(false);

  const [activeRecipeId, setActiveRecipeId] =
    useState<string | null>(null);

  const [folderMenuOpenId, setFolderMenuOpenId] =
    useState<string | null>(null);

  const folderMenuRef = useRef<HTMLDivElement>(null);

  const [moveFolderOpen, setMoveFolderOpen] =
    useState(false);

  const [moveRecipe, setMoveRecipe] =
    useState<RecipeRow | null>(null);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (!folderMenuOpenId) return;

      const target = event.target as Node;

      if (
        folderMenuRef.current &&
        !folderMenuRef.current.contains(target)
      ) {
        setFolderMenuOpenId(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleDocumentMouseDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentMouseDown
      );
    };
  }, [folderMenuOpenId]);

  async function handleRenameFolder(folderId: string) {
    await group.handleRenameFolder(folderId);
    setFolderMenuOpenId(null);
  }

  async function handleDeleteFolder(folderId: string) {
    await group.handleDeleteFolder(folderId);
    setFolderMenuOpenId(null);
  }

  async function handleToggleFavorite(
    recipeId: string,
    isFavorite: boolean,
    event?: ReactMouseEvent
  ) {
    event?.stopPropagation();

    await group.handleToggleFavorite(
      recipeId,
      isFavorite
    );
  }

  async function handleSelectMoveFolder(
    folderId: string | null
  ) {
    if (!moveRecipe) return;

    await group.handleMoveToFolder(
      moveRecipe.id,
      folderId
    );

    setMoveFolderOpen(false);
    setMoveRecipe(null);
  }

  async function handleRemoveFromGroup(
    recipeId: string,
    event?: ReactMouseEvent
  ) {
    event?.stopPropagation();
    await group.handleRemoveFromGroup(recipeId);
  }

  async function handleRemoveFromFolder(
    recipeId: string,
    event?: ReactMouseEvent
  ) {
    event?.stopPropagation();
    await group.handleRemoveFromFolder(recipeId);
  }

  async function handleDrop(
    folderId: string | null,
    event: DragEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      !draggedRecipe ||
      !group.canManageFolders
    ) {
      return;
    }

    await group.handleMoveToFolder(
      draggedRecipe,
      folderId
    );

    setDraggedRecipe(null);
  }

  function handleEdit(
    recipeId: string,
    event?: ReactMouseEvent
  ) {
    event?.stopPropagation();

    if (!group.canEdit) return;

    if (onEdit) {
      onEdit(recipeId);
      return;
    }

    setViewingRecipeId(recipeId);
  }

  function openGroupsModal(recipeId: string) {
    setActiveRecipeId(recipeId);
    setShowGroupsModal(true);
  }

  function closeGroupsModal() {
    setShowGroupsModal(false);
    setActiveRecipeId(null);
  }

  function openMoveFolder(recipe: RecipeRow) {
    setMoveRecipe(recipe);
    setMoveFolderOpen(true);
  }

  const closeMoveFolder = useCallback(() => {
    setMoveFolderOpen(false);
    setMoveRecipe(null);
  }, []);

  return {
    ...group,

    setDraggedRecipe,

    viewingRecipeId,
    setViewingRecipeId,

    showGroupsModal,
    activeRecipeId,
    openGroupsModal,
    closeGroupsModal,

    folderMenuOpenId,
    setFolderMenuOpenId,
    folderMenuRef,

    moveFolderOpen,
    moveRecipe,
    openMoveFolder,
    closeMoveFolder,

    handleRenameFolder,
    handleDeleteFolder,
    handleToggleFavorite,
    handleSelectMoveFolder,
    handleRemoveFromGroup,
    handleRemoveFromFolder,
    handleDrop,
    handleEdit,
  };
}
