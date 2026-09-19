import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";

import {
  DEMO_DETAILS,
  DEMO_RECIPES,
  type IngredientRow,
  type RecipeRow,
  type RecipeSectionRow,
} from "../../../features/recipe/demo/recipeDisplayDemoData";

type Props = {
  onBack: () => void;
  onEdit?: (
    recipeId: string,
  ) => void;
  recipeId?: string;
  autoDemo?: boolean;
  demoKey?: number;
};

const CROSS_MANUAL_VALUE =
  "__manual__";

function fmtQty(
  quantity: number | null,
) {
  if (
    quantity === null ||
    Number.isNaN(quantity)
  ) {
    return "—";
  }

  const value =
    Math.round(
      quantity * 100,
    ) / 100;

  const text =
    String(value);

  return text.endsWith(
    ".0",
  )
    ? text.slice(0, -2)
    : text;
}

function normUnit(
  unit?: string | null,
) {
  if (!unit) {
    return "";
  }

  return unit === "QS"
    ? "QS"
    : unit;
}

function isQS(
  unit?: string | null,
) {
  const value = (
    unit ?? ""
  )
    .trim()
    .toLowerCase();

  return (
    value === "qs" ||
    value === "q.s" ||
    value === "q.s."
  );
}

function formatQtyDisplay(
  qtyScaled:
    | number
    | null,
  unit:
    | string
    | null,
) {
  const normalizedUnit =
    normUnit(unit);

  if (isQS(unit)) {
    return "QS";
  }

  if (
    qtyScaled === null
  ) {
    return normalizedUnit
      ? normalizedUnit
      : "—";
  }

  if (
    qtyScaled === 0
  ) {
    return "";
  }

  return `${fmtQty(
    qtyScaled,
  )}${
    normalizedUnit
      ? ` ${normalizedUnit}`
      : ""
  }`.trim();
}

function cn(
  ...classes: Array<
    | string
    | undefined
    | false
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

function DemoRecipeSection({
  section,
  ingredients,
  activeRatio,
  isOpen,
  onToggle,
}: {
  section: RecipeSectionRow;
  ingredients: IngredientRow[];
  activeRatio: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#173E31]/8
        bg-[#FBFAF6]
        shadow-[0_8px_28px_rgba(23,62,49,0.05)]
      "
    >
      <button
        type="button"
        onClick={
          onToggle
        }
        className="
          flex
          w-full
          items-center
          justify-between
          gap-3
          px-4
          py-4
          text-left
          transition
          hover:bg-[#F7F5EF]
        "
      >
        <div className="min-w-0">
          <div
            className="
              truncate
              font-semibold
              text-[#173E31]
            "
          >
            {section.title?.trim()
              ? section.title
              : "Sans titre"}
          </div>

          <div
            className="
              mt-0.5
              text-[12px]
              text-[#8B9791]
            "
          >
            {
              ingredients.length
            }{" "}
            ingrédient(s)
            {section.instructions?.trim()
              ? " · Étapes"
              : ""}
          </div>
        </div>

        <div
          className="
            shrink-0
            text-[#718078]
          "
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {isOpen ? (
        <div
          className="
            px-4
            pb-4
          "
        >
          <div
            className="
              mb-4
              h-px
              bg-[#173E31]/8
            "
          />

          <div
            className="
              mb-2
              text-sm
              font-medium
              text-[#29493E]
            "
          >
            Ingrédients
          </div>

          {ingredients.length ===
          0 ? (
            <div
              className="
                text-sm
                text-[#8B9791]
              "
            >
              Aucun ingrédient
            </div>
          ) : (
            <ul
              className="
                space-y-1
                lg:grid
                lg:grid-cols-2
                lg:gap-x-8
                lg:gap-y-1
                lg:space-y-0
              "
            >
              {ingredients.map(
                (
                  ingredient,
                ) => {
                  const scaled =
                    ingredient.quantity ===
                      null ||
                    isQS(
                      ingredient.unit,
                    )
                      ? ingredient.quantity
                      : ingredient.quantity *
                        activeRatio;

                  const quantity =
                    formatQtyDisplay(
                      scaled,
                      ingredient.unit,
                    );

                  if (
                    !quantity
                  ) {
                    return null;
                  }

                  return (
                    <li
                      key={
                        ingredient.id
                      }
                      className="
                        flex
                        items-baseline
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          text-[#173E31]
                        "
                      >
                        {ingredient.designation ??
                          "—"}
                      </div>

                      <div
                        className="
                          whitespace-nowrap
                          text-[#718078]
                        "
                      >
                        {
                          quantity
                        }
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          )}

          <div className="mt-4">
            <div
              className="
                mb-2
                text-sm
                font-medium
                text-[#29493E]
              "
            >
              Étapes
            </div>

            {section.instructions?.trim() ? (
              <div
                className="
                  whitespace-pre-wrap
                  text-sm
                  leading-6
                  text-[#617168]
                "
              >
                {
                  section.instructions
                }
              </div>
            ) : (
              <div
                className="
                  text-sm
                  text-[#8B9791]
                "
              >
                Aucune instruction
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DemoRecipeHeader({
  recipe,
  subtitle,
  onBack,
  onEdit,
}: {
  recipe: RecipeRow;
  subtitle: string;
  onBack: () => void;
  onEdit?: (
    recipeId: string,
  ) => void;
}) {
  return (
    <div
      className="
        mb-5
        lg:mb-0
        lg:border-b
        lg:border-[#173E31]/8
        lg:pb-4
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                hidden
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#E7EEE8]
                text-[#184C3A]
                ring-1
                ring-[#173E31]/8
                lg:grid
              "
            >
              <Tag className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  font-serif
                  text-[18px]
                  font-semibold
                  text-[#173E31]
                  lg:text-base
                "
              >
                {recipe.title ??
                  "Recette"}
              </h1>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  text-[#718078]
                  lg:text-xs
                "
              >
                {
                  subtitle
                }
              </p>
            </div>
          </div>

          <button
            onClick={
              onBack
            }
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[#A8833E]
              transition
              hover:text-[#173E31]
            "
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />

            Retour
          </button>
        </div>

        {onEdit ? (
          <button
            onClick={() =>
              onEdit(
                recipe.id,
              )
            }
            className="
              h-10
              shrink-0
              rounded-full
              bg-[#DDAE9D]
              px-4
              text-sm
              font-semibold
              text-[#173E31]
              transition
              hover:bg-[#D5A18E]
            "
            type="button"
          >
            Modifier
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function RecipeDisplayDemo({
  onBack,
  onEdit,
  recipeId,
  autoDemo = false,
  demoKey = 0,
}: Props) {
  const key =
    recipeId &&
    DEMO_RECIPES[
      recipeId
    ]
      ? recipeId
      : "demo-1";

  const recipe =
    DEMO_RECIPES[key];

  const detail =
    DEMO_DETAILS[key];

  const {
    sections,
    ingredients,
    links,
  } = detail;

  const [
    servings,
    setServings,
  ] = useState<number>(
    Math.max(
      1,
      Number(
        recipe.servings ??
          1,
      ),
    ),
  );

  const [
    crossRefIngredientId,
    setCrossRefIngredientId,
  ] =
    useState<string>("");

  const [
    crossBase,
    setCrossBase,
  ] =
    useState<number>(500);

  const [
    crossHave,
    setCrossHave,
  ] =
    useState<string>("");

  const [
    openTools,
    setOpenTools,
  ] =
    useState<boolean>(
      false,
    );

  const [
    openSections,
    setOpenSections,
  ] = useState<
    Record<
      string,
      boolean
    >
  >(() =>
    Object.fromEntries(
      detail.sections.map(
        (section) => [
          section.id,
          false,
        ],
      ),
    ),
  );

  useEffect(() => {
    setServings(
      Math.max(
        1,
        Number(
          recipe.servings ??
            1,
        ),
      ),
    );

    setCrossRefIngredientId(
      "",
    );

    setCrossBase(500);

    setCrossHave("");

    setOpenTools(false);

    setOpenSections(
      Object.fromEntries(
        detail.sections.map(
          (section) => [
            section.id,
            false,
          ],
        ),
      ),
    );

    if (!autoDemo) {
      return;
    }

    const timers:
      number[] = [];

    timers.push(
      window.setTimeout(
        () => {
          setOpenTools(
            true,
          );
        },
        250,
      ),
    );

    timers.push(
      window.setTimeout(
        () => {
          setOpenSections(
            Object.fromEntries(
              detail.sections.map(
                (
                  section,
                  index,
                ) => [
                  section.id,
                  index === 0,
                ],
              ),
            ),
          );
        },
        500,
      ),
    );

    timers.push(
      window.setTimeout(
        () => {
          const firstIngredient =
            detail.ingredients.find(
              (
                ingredient,
              ) =>
                ingredient.quantity &&
                ingredient.quantity >
                  0,
            ) ?? null;

          if (
            firstIngredient
          ) {
            setCrossRefIngredientId(
              firstIngredient.id,
            );

            setCrossHave(
              String(
                Math.round(
                  (firstIngredient.quantity ??
                    1) *
                    1.6,
                ),
              ),
            );
          } else {
            setCrossHave(
              "350",
            );
          }
        },
        1200,
      ),
    );

    return () => {
      timers.forEach(
        (timer) =>
          window.clearTimeout(
            timer,
          ),
      );
    };
  }, [
    recipe.id,
    recipe.servings,
    detail.sections,
    detail.ingredients,
    autoDemo,
    demoKey,
  ]);

  const baseServings =
    Math.max(
      1,
      Number(
        recipe.servings ??
          1,
      ),
    );

  const ratio =
    servings /
    baseServings;

  const subtitle =
    `${
      recipe.category ||
      "Sans catégorie"
    } · Prépa ${
      recipe.prep_time ??
      0
    }min · Cuisson ${
      recipe.cook_time ??
      0
    }min`;

  const ingredientsById =
    useMemo(() => {
      const map =
        new Map<
          string,
          IngredientRow
        >();

      for (const ingredient of ingredients) {
        map.set(
          ingredient.id,
          ingredient,
        );
      }

      return map;
    }, [
      ingredients,
    ]);

  const sectionIngredients =
    useMemo(() => {
      const map =
        new Map<
          string,
          IngredientRow[]
        >();

      const sortedLinks =
        [...links].sort(
          (
            a,
            b,
          ) =>
            (a.order_index ??
              0) -
            (b.order_index ??
              0),
        );

      for (const link of sortedLinks) {
        const ingredient =
          ingredientsById.get(
            link.ingredient_id,
          );

        if (
          !ingredient
        ) {
          continue;
        }

        if (
          !map.has(
            link.section_id,
          )
        ) {
          map.set(
            link.section_id,
            [],
          );
        }

        map
          .get(
            link.section_id,
          )!
          .push(
            ingredient,
          );
      }

      return map;
    }, [
      links,
      ingredientsById,
    ]);

  const crossSelectableIngredients =
    useMemo(() => {
      return ingredients
        .filter(
          (
            ingredient,
          ) =>
            ingredient.quantity !==
              null &&
            Number(
              ingredient.quantity,
            ) > 0 &&
            !isQS(
              ingredient.unit,
            ),
        )
        .map(
          (
            ingredient,
          ) => ({
            id:
              ingredient.id,

            label:
              `${
                ingredient.designation ??
                "Ingrédient"
              } · ${fmtQty(
                ingredient.quantity,
              )}${
                normUnit(
                  ingredient.unit,
                )
                  ? ` ${normUnit(
                      ingredient.unit,
                    )}`
                  : ""
              }`,
          }),
        );
    }, [
      ingredients,
    ]);

  const refIngredient =
    ingredients.find(
      (
        ingredient,
      ) =>
        ingredient.id ===
        crossRefIngredientId,
    ) ?? null;

  const refBaseQty =
    refIngredient?.quantity ??
    crossBase;

  const refUnit =
    refIngredient?.unit ??
    null;

  const availableQuantity =
    Number(crossHave);

  const crossRatio =
    Number.isFinite(
      availableQuantity,
    ) &&
    availableQuantity >
      0 &&
    Number.isFinite(
      refBaseQty,
    ) &&
    refBaseQty > 0
      ? availableQuantity /
        refBaseQty
      : null;

  const activeRatio =
    crossRatio ??
    ratio;

  function toggleSection(
    id: string,
  ) {
    setOpenSections(
      (
        previous,
      ) => ({
        ...previous,
        [id]:
          !previous[
            id
          ],
      }),
    );
  }

  return (
    <div
      className="
        h-full
        w-full
      "
      translate="no"
    >
      <div
        className="
          h-full
          w-full
          overflow-hidden
          bg-[#F3F0E8]
          lg:rounded-[28px]
          lg:border
          lg:border-[#173E31]/8
          lg:bg-[#FBFAF6]
          lg:shadow-[0_18px_60px_rgba(23,62,49,0.08)]
        "
      >
        <div
          className="
            h-full
            min-h-0
            bg-[#F3F0E8]
            px-4
            pb-4
            pt-5
            lg:bg-transparent
            lg:p-6
          "
        >
          <div
            className="
              flex
              h-full
              min-h-0
              flex-col
            "
          >
            <DemoRecipeHeader
              recipe={
                recipe
              }
              subtitle={
                subtitle
              }
              onBack={
                onBack
              }
              onEdit={
                onEdit
              }
            />

            <div
              className="
                no-scrollbar
                min-h-0
                flex-1
                overflow-y-auto
                lg:grid
                lg:grid-cols-3
                lg:gap-5
                lg:pt-5
              "
            >
              <div
                className="
                  space-y-4
                  lg:space-y-5
                "
              >
                {/* OUTILS */}
                <div
                  className="
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-[#173E31]/8
                    bg-[#FBFAF6]
                    shadow-[0_8px_28px_rgba(23,62,49,0.05)]
                    lg:rounded-none
                    lg:border-0
                    lg:bg-transparent
                    lg:shadow-none
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenTools(
                        (
                          previous,
                        ) =>
                          !previous,
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-3
                      px-4
                      py-4
                      text-left
                      transition
                      hover:bg-[#F7F5EF]
                      lg:hidden
                    "
                  >
                    <div className="min-w-0">
                      <div
                        className="
                          truncate
                          font-semibold
                          text-[#173E31]
                        "
                      >
                        Multiplicateur
                      </div>
                    </div>

                    <div
                      className="
                        shrink-0
                        text-[#718078]
                      "
                    >
                      {openTools ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </button>

                  <div
                    className={cn(
                      "px-4 pb-4 lg:block lg:p-0",
                      !openTools &&
                        "hidden lg:block",
                    )}
                  >
                    <div
                      className="
                        mb-4
                        h-px
                        bg-[#173E31]/8
                        lg:hidden
                      "
                    />

                    <div className="space-y-4">
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <div
                            className="
                              text-xs
                              text-[#8B9791]
                            "
                          >
                            Multiplier
                          </div>

                          <div
                            className="
                              text-sm
                              font-semibold
                              text-[#173E31]
                            "
                          >
                            ×
                            {Math.round(
                              activeRatio *
                                100,
                            ) /
                              100}
                          </div>

                          <div
                            className="
                              mt-0.5
                              text-[12px]
                              text-[#8B9791]
                            "
                          >
                            {
                              servings
                            }{" "}
                            couvert(s)
                            (base{" "}
                            {
                              baseServings
                            }
                            )
                          </div>
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <button
                            onClick={() =>
                              setServings(
                                (
                                  current,
                                ) =>
                                  Math.max(
                                    1,
                                    current -
                                      1,
                                  ),
                              )
                            }
                            className="
                              inline-flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-2xl
                              border
                              border-[#173E31]/10
                              bg-[#F7F5EF]
                              text-[#173E31]
                              transition
                              hover:bg-[#E7EEE8]
                              disabled:opacity-40
                            "
                            type="button"
                            aria-label="Diminuer"
                            disabled={
                              servings <=
                                1 ||
                              !!crossRatio
                            }
                          >
                            –
                          </button>

                          <button
                            onClick={() =>
                              setServings(
                                (
                                  current,
                                ) =>
                                  current +
                                  1,
                              )
                            }
                            className="
                              inline-flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-2xl
                              bg-[#E7EEE8]
                              font-semibold
                              text-[#184C3A]
                              ring-1
                              ring-[#173E31]/8
                              transition
                              hover:bg-[#DDE8DF]
                              disabled:opacity-40
                            "
                            type="button"
                            aria-label="Augmenter"
                            disabled={
                              !!crossRatio
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div
                        className="
                          h-px
                          bg-[#173E31]/8
                        "
                      />

                      {/* SELECT NATIF — PAS DE PORTAL RADIX */}
                      <div>
                        <div
                          className="
                            mb-2
                            text-xs
                            text-[#8B9791]
                          "
                        >
                          Ingrédient de référence
                        </div>

                        <div className="relative">
                          <select
                            value={
                              crossRefIngredientId ||
                              CROSS_MANUAL_VALUE
                            }
                            onChange={(
                              event,
                            ) =>
                              setCrossRefIngredientId(
                                event
                                  .target
                                  .value ===
                                  CROSS_MANUAL_VALUE
                                  ? ""
                                  : event
                                      .target
                                      .value,
                              )
                            }
                            className="
                              h-11
                              w-full
                              appearance-none
                              rounded-2xl
                              border
                              border-[#173E31]/10
                              bg-[#F7F5EF]
                              px-4
                              pr-10
                              text-sm
                              text-[#173E31]
                              outline-none
                              transition
                              focus:border-[#C7A45D]/50
                              focus:ring-2
                              focus:ring-[#C7A45D]/15
                            "
                          >
                            <option
                              value={
                                CROSS_MANUAL_VALUE
                              }
                            >
                              Manuel (pas d’ingrédient)
                            </option>

                            {crossSelectableIngredients.map(
                              (
                                option,
                              ) => (
                                <option
                                  key={
                                    option.id
                                  }
                                  value={
                                    option.id
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>
                              ),
                            )}
                          </select>

                          <ChevronDown
                            className="
                              pointer-events-none
                              absolute
                              right-4
                              top-1/2
                              h-4
                              w-4
                              -translate-y-1/2
                              text-[#718078]
                            "
                          />
                        </div>

                        {refIngredient ? (
                          <div
                            className="
                              mt-2
                              text-xs
                              text-[#8B9791]
                            "
                          >
                            Base auto :{" "}
                            {fmtQty(
                              refBaseQty,
                            )}
                            {normUnit(
                              refUnit,
                            )
                              ? ` ${normUnit(
                                  refUnit,
                                )}`
                              : ""}
                          </div>
                        ) : null}
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                        "
                      >
                        {!refIngredient ? (
                          <div>
                            <div
                              className="
                                text-xs
                                text-[#8B9791]
                              "
                            >
                              Base
                            </div>

                            <input
                              type="number"
                              inputMode="numeric"
                              value={
                                crossBase
                              }
                              onChange={(
                                event,
                              ) => {
                                const value =
                                  Number(
                                    event
                                      .target
                                      .value,
                                  );

                                setCrossBase(
                                  Number.isFinite(
                                    value,
                                  ) &&
                                    value >
                                      0
                                    ? value
                                    : 1,
                                );
                              }}
                              className="
                                mt-1
                                h-11
                                w-full
                                rounded-2xl
                                border
                                border-[#173E31]/10
                                bg-[#F7F5EF]
                                px-4
                                text-[#173E31]
                                outline-none
                                focus:border-[#C7A45D]/50
                                focus:ring-2
                                focus:ring-[#C7A45D]/15
                              "
                            />
                          </div>
                        ) : (
                          <div>
                            <div
                              className="
                                text-xs
                                text-[#8B9791]
                              "
                            >
                              Base
                              (auto)
                            </div>

                            <div
                              className="
                                mt-1
                                flex
                                h-11
                                items-center
                                rounded-2xl
                                border
                                border-[#173E31]/8
                                bg-[#F7F5EF]
                                px-4
                                text-[#173E31]
                              "
                            >
                              {fmtQty(
                                refBaseQty,
                              )}
                              {normUnit(
                                refUnit,
                              )
                                ? ` ${normUnit(
                                    refUnit,
                                  )}`
                                : ""}
                            </div>
                          </div>
                        )}

                        <div>
                          <div
                            className="
                              text-xs
                              text-[#8B9791]
                            "
                          >
                            J’ai
                            {refIngredient &&
                            normUnit(
                              refUnit,
                            )
                              ? ` (${normUnit(
                                  refUnit,
                                )})`
                              : ""}
                          </div>

                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder={
                              refIngredient
                                ? "ex: 763"
                                : "ex: 350"
                            }
                            value={
                              crossHave
                            }
                            onChange={(
                              event,
                            ) =>
                              setCrossHave(
                                event
                                  .target
                                  .value,
                              )
                            }
                            className="
                              mt-1
                              h-11
                              w-full
                              rounded-2xl
                              border
                              border-[#173E31]/10
                              bg-[#F7F5EF]
                              px-4
                              text-[#173E31]
                              outline-none
                              placeholder:text-[#8B9791]
                              focus:border-[#C7A45D]/50
                              focus:ring-2
                              focus:ring-[#C7A45D]/15
                            "
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {crossRatio ? (
                          <button
                            onClick={() =>
                              setCrossHave(
                                "",
                              )
                            }
                            className="
                              w-full
                              rounded-2xl
                              bg-[#E7EEE8]
                              px-4
                              py-3
                              text-sm
                              font-medium
                              text-[#184C3A]
                              ring-1
                              ring-[#173E31]/8
                              transition
                              hover:bg-[#DDE8DF]
                            "
                            type="button"
                          >
                            Désactiver le produit en croix
                          </button>
                        ) : null}

                        <button
                          onClick={() => {
                            setServings(
                              baseServings,
                            );

                            setCrossHave(
                              "",
                            );

                            setCrossBase(
                              500,
                            );

                            setCrossRefIngredientId(
                              "",
                            );
                          }}
                          className="
                            w-full
                            rounded-2xl
                            bg-[#F7F5EF]
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-[#617168]
                            ring-1
                            ring-[#173E31]/8
                            transition
                            hover:bg-[#E7EEE8]
                          "
                          type="button"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALLERGÈNES */}
                {recipe.allergens?.trim() ? (
                  <div
                    className="
                      rounded-[24px]
                      border
                      border-[#173E31]/8
                      bg-[#FBFAF6]
                      p-4
                      shadow-[0_8px_28px_rgba(23,62,49,0.04)]
                    "
                  >
                    <div
                      className="
                        mb-2
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      Allergènes
                    </div>

                    <div
                      className="
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-[#617168]
                      "
                    >
                      {
                        recipe.allergens
                      }
                    </div>
                  </div>
                ) : null}
              </div>

              {/* SECTIONS */}
              <div
                className="
                  space-y-4
                  lg:col-span-2
                "
              >
                {sections.map(
                  (
                    section,
                  ) => (
                    <DemoRecipeSection
                      key={
                        section.id
                      }
                      section={
                        section
                      }
                      ingredients={
                        sectionIngredients.get(
                          section.id,
                        ) ??
                        []
                      }
                      activeRatio={
                        activeRatio
                      }
                      isOpen={Boolean(
                        openSections[
                          section
                            .id
                        ],
                      )}
                      onToggle={() =>
                        toggleSection(
                          section.id,
                        )
                      }
                    />
                  ),
                )}

                {recipe.notes?.trim() ? (
                  <div
                    className="
                      rounded-[24px]
                      border
                      border-[#173E31]/8
                      bg-[#FBFAF6]
                      p-4
                      shadow-[0_8px_28px_rgba(23,62,49,0.04)]
                    "
                  >
                    <div
                      className="
                        mb-2
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      Notes
                    </div>

                    <div
                      className="
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-[#617168]
                      "
                    >
                      {
                        recipe.notes
                      }
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
