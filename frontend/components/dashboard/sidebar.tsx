"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Globe,
  Plus,
  Check,
  User,
  LogOut,
  Folder,
  Star,
  Code,
  Palette,
  Wrench,
  BookOpen,
  Sparkles,
  Tag,
  Archive,
  Trash2,
} from "lucide-react";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useTagsStore } from "@/store/tags-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useAddBookmarkDialogStore } from "@/store/add-bookmark-dialog-store";

import Image from "next/image";
import logo from '@/app/favicon.ico';

const collectionIcons: Record<string, React.ElementType> = {
  bookmark: Bookmark,
  palette: Palette,
  code: Code,
  wrench: Wrench,
  "book-open": BookOpen,
  sparkles: Sparkles,
};

const navItems = [
  { icon: Star, label: "Favorites", href: "/favorites" },
  { icon: Archive, label: "Archive", href: "/archive" },
];

export function BookmarksSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [collectionsOpen, setCollectionsOpen] = React.useState(true);
  const [tagsOpen, setTagsOpen] = React.useState(true);

const collections = useCollectionsStore((state) => state.collections);
const tags = useTagsStore((state) => state.tags);
  const {
    selectedCollection,
    setSelectedCollection,
    selectedTags,
    toggleTag,
    clearTags,
  } = useBookmarksStore();

  const isHomePage = pathname === "/";

  return (
    <Sidebar collapsible="offcanvas" className="lg:border-r-0!" {...props}>
      <SidebarHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              
              <Image
                        src={logo}
                        alt="Oxygene Logo"
                        width={24}
                        height={24}
                        className={cn("size-6")}
                      />
              <span className="font-medium text-muted-foreground">
                Oxygene
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => useAddBookmarkDialogStore.getState().setOpen(true)}>
                <Plus className="size-4 mr-2" />
                Create Bookmark
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="size-4 mr-2" />
                Account Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive">
                <LogOut className="size-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-5 pt-5">
       

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="flex items-center gap-1.5 px-0 text-[10px] font-semibold tracking-wider text-muted-foreground">
            <button
              onClick={() => setCollectionsOpen(!collectionsOpen)}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  !collectionsOpen && "-rotate-90"
                )}
              />
              COLLECTIONS
            </button>
          </SidebarGroupLabel>
          {collectionsOpen && (
            <SidebarGroupContent>
              <SidebarMenu className="mt-2">
                {collections.map((collection) => {
                  const IconComponent =
                    collectionIcons[collection.icon] || Folder;
                  const isActive =
                    isHomePage && selectedCollection === collection.id;
                  return (
                    <SidebarMenuItem key={collection.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="h-[38px]"
                      >
                        <Link
                          href="/"
                          onClick={() => {
                            setSelectedCollection(collection.id);
                            clearTags();
                          }}
                        >
                          <IconComponent className="size-5" />
                          <span className="flex-1">{collection.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {collection.count}
                          </span>
                          {isActive && (
                            <ChevronRight className="size-4 text-muted-foreground opacity-60" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
              <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-[38px]"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="flex items-center gap-1.5 px-0 text-[10px] font-semibold tracking-wider text-muted-foreground">
            <button
              onClick={() => setTagsOpen(!tagsOpen)}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  !tagsOpen && "-rotate-90"
                )}
              />
              TAGS
            </button>
            {selectedTags.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearTags();
                }}
                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </SidebarGroupLabel>
          {tagsOpen && (
            <SidebarGroupContent>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                      selectedTags.includes(tag.id)
                        ? "bg-primary text-primary-foreground"
                        : tag.color
                    )}
                  >
                    <Tag className="size-3" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

      
      </SidebarContent>

    </Sidebar>
  );
}
